import dotenv from 'dotenv'
import folders from './folders.js';
import { join } from 'node:path/posix';

dotenv.config({quiet: true, path: join(folders.root, '.env.nswow')});
dotenv.config({quiet: true, path: join(folders.root, '.env.production.local')});
dotenv.config({quiet: true, path: join(folders.root, '.env.production')});
dotenv.config({quiet: true});