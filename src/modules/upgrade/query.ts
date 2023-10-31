import { BluechipClient } from '../../core';
import { ModuleVersion, Plan } from '../../bluechip/lib/generated/cosmos/upgrade/v1beta1/upgrade';


type BluechipPlan = {
  name: string;
  height: number;
  info: string;
}

type BluechipModuleVersion = {
  name: string;
  version: string
}

export const getCurrentPlan = (
  client: BluechipClient,
): Promise<BluechipPlan> =>
  client.queryClient.upgrade.CurrentPlan({})
    .then(res => parsePlan(res.plan));


export const getAppliedPlan = (
  client: BluechipClient,
  name: string
) =>
  client.queryClient.upgrade.AppliedPlan({
    name,
  })
    .then(res => ({
      height: res.height.toNumber()
    }));


export const getModuleVersions = (
  client: BluechipClient,
  moduleName: string
): Promise<BluechipModuleVersion[]> =>
  client.queryClient.upgrade.ModuleVersions({
    moduleName
  })
    .then(res => res.moduleVersions.map(parseModuleVersion));


const parsePlan = (plan?: Plan): BluechipPlan => plan ? {
  name: plan.name,
  height: plan.height.toNumber(),
  info: plan.info,
}: {
  name: "",
  height: -1,
  info: "",
};

const parseModuleVersion = (moduleVersion: ModuleVersion): BluechipModuleVersion => ({
  name: moduleVersion.name,
  version: moduleVersion.version.toString(),
});
