import { ClientOptions } from "discord.js";
import * as dotenv from 'dotenv';

const initConfig = () => {
  dotenv.config();
}

const getToken = () => {
  let profile = <string> process.env.profile;
  
  if(profile === 'prod') {
    return <string> process.env.token;
  }
  return 'Invalid Profile';
}

const clientOptions: ClientOptions = {
  presence: {
    activity: {
      type: 'LISTENING',
      name: 'Great Vibes'
    }
  }
};

export { initConfig, getToken, clientOptions };