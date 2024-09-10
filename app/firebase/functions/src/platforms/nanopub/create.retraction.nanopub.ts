import { AppPostFull } from '../../@shared/types/types.posts';
import { AppUser } from '../../@shared/types/types.user';
import { buildRetractionNp } from './nanopub.utils';
import { prepareNanopubDetails } from './prepare.nanopub.details';

export const createRetractionNanopub = async (
  post_id: string,
  post: AppPostFull,
  author: AppUser
) => {
  const { introUri, platformUsername, platformName, ethAddress, orcidId } =
    prepareNanopubDetails(author, post);

  return buildRetractionNp(
    post_id,
    introUri,
    platformUsername,
    platformName,
    ethAddress,
    orcidId
  );
};
