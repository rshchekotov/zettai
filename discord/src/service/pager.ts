import {
  Message,
  MessageAttachment,
  MessageEmbed,
  MessageReaction,
  TextChannel,
} from "discord.js";
import * as Cache from "node-cache";

const pagedCache = new Cache();

export class PagedEmbed {
  loaded: boolean = false;
  message: Message | null = null;
  title: string = "";
  page: number = 0;
  pages: string[];
  attached: Message[] = [];
  files: { page: number; attach: MessageAttachment }[] = [];

  updateAction = async (page: number) => {};

  constructor(pages: string[], title?: string) {
    this.pages = pages;
    if (title) this.title = title;
  }

  async react(reaction: MessageReaction, user: string) {
    if (!this.message || !this.loaded) return;
    let eid = reaction.emoji.id || reaction.emoji.name;
    let r = ["◀️", "🗑️", "❄️", "▶️"];
    if (r.includes(eid)) {
      await reaction.users.remove(user);
      if (eid === r[1]) {
        await this.rm();
      } else if (eid === r[2]) {
        if (pagedCache.has(this.message.id)) pagedCache.del(this.message.id);
        await reaction.message.reactions.removeAll();
      } else {
        await this.turn(eid === r[0] ? -1 : 1);
        await this.update();
      }
    }
  }

  /**
   * Sends the PagedEmbed into a Channel.
   * @param channel where to send the message
   */
  async send(channel: TextChannel) {
    let embed = new MessageEmbed().setTitle(`*Loading Embed*`);

    this.files = this.prepareLocalResources();
    embed.attachFiles(this.files.map((file) => file.attach));
    this.message = await channel.send(embed);

    let source = this.format();
    let current = this.files.find(
      (o) =>
        o.page === this.page && /.+\.(?:png|jpe?g|gif)/.test(o.attach.name!)
    );
    if (current)
      source.pagedEmbed.setImage(`attachment://${current.attach.name}`);

    await this.message.edit({ embed: source.pagedEmbed });
    this.loaded = true;
    this.updateAttachments(source.attachments);
  }

  /**
   * If the embed has been sent and has pages, update discord embed to local version.
   * If the local embed has attachments, additionally update the attachments.
   */
  async update() {
    if (!this.message) return;
    let edit = this.format();
    if (!edit.pagedEmbed.footer) return;
    await this.message.edit({ embed: edit.pagedEmbed });
    if (edit.attachments.length > 0)
      await this.updateAttachments(edit.attachments);
  }

  /**
   * Formats current PagedEmbed into a Discord MessageEmbed.
   * @returns (Embed, Attachment) Tuple
   */
  format() {
    let embed: MessageEmbed = new MessageEmbed()
      .setTitle(this.title)
      .setTimestamp();

    // PAGES FOOTER
    if (this.pages.length > 1)
      embed.setFooter(`Page ${this.page + 1}/${this.pages.length}`);
    let content = this.pages[this.page];

    // TITLE PARSING
    let titleRegex = /‡title=([^‡]+)‡\n?/;
    if (titleRegex.test(content)) {
      let title = titleRegex.exec(content)![1];
      embed.setTitle(title);
      content = content.replace(titleRegex, () => "");
    }

    let attachments: string[] = [];
    let fieldRegex = /‡([^‡]+):=:([^‡]+)‡\n?/;
    while (fieldRegex.test(content)) {
      content = content.replace(fieldRegex, (m, p1, p2) => {
        embed.addField(p1, p2);
        return "";
      });
    }

    // MEDIA ATTACHMENTS
    let mediaRegEx = /(?:https?|attachment):\/\/[^ ]*\.(?:png|jpe?g|gifv?)/;
    while (mediaRegEx.test(content)) {
      content = content.replace(mediaRegEx, (m) => {
        if (!m.startsWith("attachment")) attachments.push(m);
        return `[attach-#${attachments.length}]`;
      });
    }

    if (attachments.length > 0) {
      if (attachments.length === 1) {
        embed.setImage(attachments[0]);
        attachments = [];
      }
    }

    // EMBED DESCRIPTION
    embed.setDescription(content);

    return {
      pagedEmbed: embed,
      attachments: attachments,
    };
  }

  /**
   * Turn {count} pages
   * @param count pages to flip forward
   */
  async turn(count: number) {
    let mod = this.pages.length;
    let dest = (mod + count + this.page) % mod;
    this.page = dest;
    await this.updateAction(this.page);
    this.save();
  }

  /**
   * Save/Update PagedEmbed into Cache
   */
  save() {
    if (this.message !== null) pagedCache.set(this.message.id, this);
  }

  prepareLocalResources() {
    let attachments: { page: number; attach: MessageAttachment }[] = [];

    this.pages = this.pages.map((page, index) => {
      let attachRegex = /‡local=([^‡]+)‡\n?/;
      if (attachRegex.test(page)) {
        let path = attachRegex.exec(page)![1];
        let file = path.split("/");
        const attachment = new MessageAttachment(path, file[file.length - 1]);
        attachments.push({ page: index, attach: attachment });
        return page.replace(attachRegex, () => "");
      }
      return page;
    });

    return attachments;
  }

  /**
   * Gets called for every page. In case that there are images registered
   * for the page, it will remove the old ones and send the new attached
   * images.
   * @param attachments images attached to the new page
   */
  async updateAttachments(attachments: (string | MessageAttachment)[]) {
    let msg: Message | undefined;
    for (let attach of this.attached) {
      if (!msg) return;
      await attach.delete();
    }
    this.attached = [];
    for (let attach of attachments) {
      msg = await this.message!.channel.send(
        new MessageEmbed()
          .setTitle(`Attachment #${attachments.indexOf(attach) + 1}`)
          .setImage(typeof attach === "string" ? attach : attach.url)
      );
      this.attached.push(msg);
    }
    this.save();
  }

  /**
   * Removes PagedEmbed from Discord and Cache. Deletes all related Attachments as well.
   * Only way to call is to Remove via Reaction. In order to react the message has to exist.
   */
  async rm() {
    if (pagedCache.has(this.message!.id)) pagedCache.del(this.message!.id);
    await this.message!.delete();
    this.attached.forEach(async (attach) => {
      if (!attach) return;
      await attach.delete();
    });
  }
}

export function isPagedEmbed(msg: string): PagedEmbed | boolean {
  if(pagedCache.has(msg))
    return <PagedEmbed> pagedCache.get(msg);
  else return false;
}