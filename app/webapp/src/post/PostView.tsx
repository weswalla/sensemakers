import { Anchor, Box } from 'grommet';
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
import { concatenateThread } from './posts.helper';

/** extract the postId from the route and pass it to a PostContext */
export const PostView = (props: {
  profile?: TwitterUserProfile;
  isProfile: boolean;
}) => {
  const { constants } = useThemeContext();
  const {
    post,
    nanopubDraft,
    updateSemantics,
    postStatuses,
    reparse,
    updatePost,
    isUpdating,
    approveOrUpdate,
    editable: _editable,
    enabledEdit,
    setEnabledEdit,
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

  const { signNanopublication } = useNanopubContext();

  const canPublishNanopub =
    connectedUser &&
    connectedUser.nanopub &&
    connectedUser.nanopub.length > 0 &&
    signNanopublication &&
    nanopubDraft &&
    !postStatuses.published;

  const { action: rightClicked, label: rightLabel } = (() => {
    if (canPublishNanopub && nanopubDraft && !postStatuses.published) {
      return {
        action: () => approveOrUpdate(),
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

    if (!postStatuses.published && !postStatuses.ignored) {
      return (
        <Box direction="row" gap="small" margin={{ top: 'medium' }}>
          <Box style={{ flexGrow: 1 }}>
            <AppButton
              disabled={isUpdating}
              icon={<ClearIcon></ClearIcon>}
              onClick={() => ignore()}
              label="Ignore"></AppButton>
          </Box>
          <Box style={{ flexGrow: 1 }} align="end" gap="small">
            <AppButton
              primary
              disabled={isUpdating}
              icon={<SendIcon></SendIcon>}
              onClick={() => rightClicked()}
              label={rightLabel}
              style={{ width: '100%' }}></AppButton>
          </Box>
        </Box>
      );
    }

    if (enabledEdit) {
      return (
        <Box direction="row" gap="small" margin={{ top: 'medium' }}>
          <Box style={{ flexGrow: 1 }}>
            <AppButton
              disabled={isUpdating}
              icon={<ClearIcon></ClearIcon>}
              onClick={() => setEnabledEdit(false)}
              label="Cancel"></AppButton>
          </Box>
          <Box style={{ flexGrow: 1 }} align="end" gap="small">
            <AppButton
              primary
              disabled={isUpdating}
              icon={<SendIcon></SendIcon>}
              onClick={() => approveOrUpdate()}
              label="update"
              style={{ width: '100%' }}></AppButton>
          </Box>
        </Box>
      );
    }

    return <></>;
  })();

  const editable = _editable && !props.isProfile;

  const content = (() => {
    if (!post) {
      return (
        <Box gap="12px" pad="medium">
          <LoadingDiv height="90px" width="100%"></LoadingDiv>
          <LoadingDiv height="200px" width="100%"></LoadingDiv>
          <LoadingDiv height="120px" width="100%"></LoadingDiv>
        </Box>
      );
    }

    return (
      <>
        <Box pad="medium">
          <PostHeader
            isProfile={props.isProfile}
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
          <PostText text={concatenateThread(post.generic)}></PostText>
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
            isProfile={props.isProfile}
            profile={props.profile}></PostNav>
          {content}
        </Box>
      }></ViewportPage>
  );
};
