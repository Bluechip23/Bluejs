import {doBuildBluechipStore} from "./build-bluechip-store";
import {rm} from "fs/promises";
import {exec, cd} from "@scottburch/exec";
import * as path from 'path'

doBuildBluechipStore()
    .then(() => cd(path.join(__dirname, '..')))
    .then(() => rm(path.join(__dirname, '../lib-web'), {recursive: true, force: true}))
    .then(() => exec`yarn webpack -c ./browser.webpack.config.js`.toPromise())
    .then(() => exec`yarn dts-bundle-generator -o lib-web/browser.d.ts --project ./tsconfig.json src/index.ts --no-check`.toPromise())
