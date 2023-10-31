export {
  submitTextProposal,
  submitSoftwareUpgradeProposal,
  submitCommunityPoolSpendProposal,
  submitParameterChangeProposal,
  vote,
  voteWithWeights,
  depositToProposal
} from  './tx';


export {
  getVotingParams,
  getDepositParams,
  getTallyParams,
  getProposal,
  getDeposit,
} from './query';

export {
  VoteOption
} from '../../bluechip/lib/generated/cosmos/gov/v1beta1/gov';
