import * as path from "path";
import {downloadAllProto} from "../proto-builder/buildProtoDir";
import {generateAllProto} from "../proto-builder/compileProto";
import {mkdir} from "fs/promises";
import {cd, exec} from "@scottburch/exec";

const rootDir = () => path.join(__dirname, '../../..');

process.argv[1] === __filename && setTimeout(() => doBuildBluechipStore())

export const doBuildBluechipStore = () =>
    mkdir(rootDir() + '/sdk/ts/src/bluechip/store', {recursive: true})
        .then(generateSdkBluechip)
        .then(buildBluechipStore)
        .then(removeBluechipStoreDir)

const generateSdkBluechip = () =>
    downloadAllProto()
        .then(() => generateAllProto('proto', rootDir() + '/sdk/ts/src/bluechip/store'));

const buildBluechipStore = () =>
    Promise.resolve(cd(rootDir() + '/sdk/ts/src/bluechip'))
        .then(() => removeBluechipLibDir())
        .then(() => exec`yarn`.toPromise())
        .then(() => exec`yarn tsc`.toPromise());

function removeBluechipStoreDir() {
    return exec`rm -rf ${rootDir() + '/sdk/ts/src/bluechip/store'}`.toPromise();
}

function removeBluechipLibDir() {
    return exec`rm -rf ${rootDir() + '/sdk/ts/src/bluechip/lib'}`.toPromise();
}

