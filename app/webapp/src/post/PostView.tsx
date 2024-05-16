import { Box } from 'grommet';
import { Refresh } from 'grommet-icons';

import { ClearIcon } from '../app/icons/ClearIcon';
import { SendIcon } from '../app/icons/SendIcon';
import { ViewportPage } from '../app/layout/Viewport';
import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { PATTERN_ID } from '../semantics/patterns/patterns';
import { AppPostReviewStatus } from '../shared/types/types.posts';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { AppButton } from '../ui-components';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useNanopubContext } from '../user-login/contexts/platforms/nanopubs/NanopubContext';
import { usePost } from './PostContext';
import { PostHeader } from './PostHeader';
import { PostNav } from './PostNav';
import { PostText } from './PostText';

/** extract the postId from the route and pass it to a PostContext */
export const PostView = (props: {
  prevPostId?: string;
  nextPostId?: string;
  profile?: TwitterUserProfile;
}) => {
  const { constants } = useThemeContext();
  const { prevPostId, nextPostId } = props;
  const {
    post,
    nanopubDraft,
    updateSemantics,
    postStatuses,
    reparse,
    updatePost,
    isUpdating,
    approve,
  } = usePost();

  const { connectedUser } = useAccountContext();

  const semanticsUpdated = (newSemantics: string) => {
    updateSemantics(newSemantics);
  };

  const reviewForPublication = async () => {
    if (!post) {
      throw new Error(`Unexpected post not found`);
    }
    updatePost({
      reviewedStatus: AppPostReviewStatus.PENDING,
    });
  };

  const ignore = async () => {
    if (!post) {
      throw new Error(`Unexpected post not found`);
    }
    updatePost({
      reviewedStatus: AppPostReviewStatus.IGNORED,
    });
  };

  const { signNanopublication, connect } = useNanopubContext();

  const canPublishNanopub =
    connectedUser &&
    connectedUser.nanopub &&
    connectedUser.nanopub.length > 0 &&
    signNanopublication &&
    nanopubDraft &&
    !postStatuses.nanopubPublished;

  const { action: rightClicked, label: rightLabel } = (() => {
    if (!canPublishNanopub) {
      return {
        action: () => connect(),
        label: 'Connect',
      };
    }

    if (canPublishNanopub && nanopubDraft && !postStatuses.nanopubPublished) {
      return {
        action: () => approve(),
        label: 'Nanopublish',
      };
    }

    return {
      action: () => {},
      label: '',
    };
  })();

  const action = (() => {
    if (!postStatuses.processed && !postStatuses.isParsing) {
      return (
        <AppButton
          margin={{ top: 'medium' }}
          icon={<Refresh color={constants.colors.text}></Refresh>}
          style={{ width: '100%' }}
          onClick={() => reparse()}
          label="Process"></AppButton>
      );
    }

    if (!postStatuses.nanopubPublished && !postStatuses.ignored) {
      return (
        <Box direction="row" gap="small" margin={{ top: 'medium' }}>
          <AppButton
            disabled={isUpdating}
            icon={<ClearIcon></ClearIcon>}
            style={{ width: '50%' }}
            onClick={() => ignore()}
            label="Ignore"></AppButton>
          <AppButton
            primary
            disabled={isUpdating}
            icon={<SendIcon></SendIcon>}
            style={{ width: '50%' }}
            onClick={() => rightClicked()}
            label={rightLabel}></AppButton>
        </Box>
      );
    }
    return <></>;
  })();

  const editable =
    connectedUser?.userId === post?.authorId && !postStatuses.published;

  const content = (() => {
    if (!post) {
      return (
        <Box gap="12px" pad="medium">
          <LoadingDiv height="90px" width="100%"></LoadingDiv>
          <LoadingDiv height="200px" width="100%"></LoadingDiv>
          <LoadingDiv height="120px" width="100%"></LoadingDiv>;
        </Box>
      );
    }

    return (
      <>
        <Box pad="medium">
          <PostHeader
            profile={props.profile}
            margin={{ bottom: '16px' }}></PostHeader>
          {postStatuses.isParsing ? (
            <LoadingDiv height="60px" width="100%"></LoadingDiv>
          ) : (
            <SemanticsEditor
              isLoading={false}
              patternProps={{
                editable,
                semantics: post?.semantics,
                originalParsed: post?.originalParsed,
                semanticsUpdated: semanticsUpdated,
              }}
              include={[PATTERN_ID.KEYWORDS]}></SemanticsEditor>
          )}
          <PostText text={post?.content}></PostText>
          {postStatuses.isParsing ? (
            <LoadingDiv height="120px" width="100%"></LoadingDiv>
          ) : (
            <SemanticsEditor
              isLoading={false}
              patternProps={{
                editable,
                semantics: post?.semantics,
                originalParsed: post?.originalParsed,
                semanticsUpdated: semanticsUpdated,
              }}
              include={[PATTERN_ID.REF_LABELS]}></SemanticsEditor>
          )}
          {action}
          {postStatuses.ignored ? (
            <AppButton
              disabled={isUpdating}
              margin={{ top: 'medium' }}
              primary
              onClick={() => reviewForPublication()}
              label="Review for publication"></AppButton>
          ) : (
            <></>
          )}
        </Box>
      </>
    );
  })();

  return (
    <ViewportPage
      content={
        <Box fill>
          <PostNav
            profile={props.profile}
            prevPostId={prevPostId}
            nextPostId={nextPostId}></PostNav>
          {content}
        </Box>
      }></ViewportPage>
  );
};
