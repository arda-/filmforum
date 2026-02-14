import ReactionButtons from './ReactionButtons.astro';

export default {
  component: ReactionButtons,
};

export const Default = {
  args: { movieId: 'demo-1' },
};

export const YesSelected = {
  args: { movieId: 'demo-2', reaction: 'yes' },
};

export const MaybeSelected = {
  args: { movieId: 'demo-3', reaction: 'maybe' },
};

export const NoSelected = {
  args: { movieId: 'demo-4', reaction: 'no' },
};

export const Small = {
  args: { movieId: 'demo-5', size: 'sm' },
};

export const SmallYes = {
  args: { movieId: 'demo-6', reaction: 'yes', size: 'sm' },
};
