import { Box, Text } from 'grommet';
import { Refresh } from 'grommet-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAppFetch } from '../api/app.fetch';
import { ClearIcon } from '../app/icons/ClearIcon';
import { SendIcon } from '../app/icons/SendIcon';
import { ViewportPage } from '../app/layout/Viewport';
import { I18Keys } from '../i18n/i18n';
import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { PATTERN_ID, PatternProps } from '../semantics/patterns/patterns';
import { AppPostReviewStatus } from '../shared/types/types.posts';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { AppButton } from '../ui-components';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useOrcidContext } from '../user-login/contexts/platforms/OrcidContext';
import { useNanopubContext } from '../user-login/contexts/platforms/nanopubs/NanopubContext';
import { usePersist } from '../utils/use.persist';
import { usePost } from './PostContext';
import { PostHeader } from './PostHeader';
import { PostNav } from './PostNav';
import { PostTextEditable } from './PostTextEditable';
import { POSTING_POST_ID } from './PostingPage';
import { concatenateThread, hideSemanticsHelper } from './posts.helper';

const DEBUG = true;

/** extract the postId from the route and pass it to a PostContext */
export const PostView = (props: { profile?: TwitterUserProfile }) => {
  const appFetch = useAppFetch();

  // shared persisted state with PostingPage.tsx
  const [postingPostId, setPostingPostId] = usePersist<string>(
    POSTING_POST_ID,
    null
  );
  // local state to prevent detecting the returning before leaving
  const [justSetPostId, setJustSetPostId] = useState<boolean>(false);

  const [_isReparsing, setIsReparsing] = useState(false);

  const { connect: _connectOrcid } = useOrcidContext();

  const { constants } = useThemeContext();
  const { current, update, publish } = usePost();

  const postText = current.post
    ? concatenateThread(current.post.generic)
    : undefined;

  const { connectedUser } = useAccountContext();

  const { t } = useTranslation();

  const semanticsUpdated = (newSemantics: string) => {
    update.updateSemantics(newSemantics);
  };

  const reparse = async () => {
    try {
      setIsReparsing(true);
      await appFetch('/api/posts/parse', { postId: current.postId });
      setIsReparsing(false);
    } catch (e: any) {
      setIsReparsing(false);
      console.error(e);
      throw new Error(e);
    }
  };

  const ignore = async () => {
    if (!current.post) {
      throw new Error(`Unexpected post not found`);
    }
    update.updatePost({
      reviewedStatus: AppPostReviewStatus.IGNORED,
    });
  };

  const reviewForPublication = async () => {
    if (!current.post) {
      throw new Error(`Unexpected post not found`);
    }
    update.updatePost({
      reviewedStatus: AppPostReviewStatus.PENDING,
    });
  };

  const enableEditOrUpdate = () => {
    if (!update.enabledEdit) {
      update.setEnabledEdit(true);
    } else {
      publish.publishOrRepublish();
    }
  };

  const cancelEdit = () => {
    update.setEnabledEdit(false);
  };

  const { signNanopublication } = useNanopubContext();

  const canPublishNanopub =
    connectedUser &&
    connectedUser.nanopub &&
    connectedUser.nanopub.length > 0 &&
    signNanopublication &&
    current.nanopubDraft;

  const readyToNanopublish =
    canPublishNanopub && current.nanopubDraft && !current.statuses.live;

  // receives the navigate from PostingPage and opens the post intent
  useEffect(() => {
    if (postingPostId && connectedUser && !justSetPostId && current.postId) {
      if (DEBUG) console.log(`posting post detected for ${postingPostId}`);
      setPostingPostId(null);
    }
  }, [postingPostId, connectedUser, justSetPostId, current.postId]);

  const action = (() => {
    if (!current.statuses.processed && !current.statuses.isParsing) {
      return (
        <AppButton
          margin={{ top: 'medium' }}
          icon={<Refresh color={constants.colors.text}></Refresh>}
          style={{ width: '100%' }}
          onClick={() => reparse()}
          label="Process"></AppButton>
      );
    }

    if (current.statuses.ignored) {
      return (
        <AppButton
          disabled={update.isUpdating}
          margin={{ top: 'medium' }}
          primary
          onClick={() => reviewForPublication()}
          label="Review for publication"></AppButton>
      );
    }

    if (!current.statuses.live && !current.statuses.ignored) {
      return (
        <Box direction="row" gap="small" margin={{ top: 'medium' }}>
          <Box width="50%" style={{ flexGrow: 1 }}>
            <AppButton
              disabled={update.isUpdating}
              icon={<ClearIcon></ClearIcon>}
              onClick={() => ignore()}
              label={t(I18Keys.ignore)}></AppButton>
          </Box>
          <Box width="50%" align="end" gap="small">
            <AppButton
              primary
              disabled={update.isUpdating || !readyToNanopublish}
              icon={<SendIcon></SendIcon>}
              onClick={() => setApproveIntent(true)}
              label={t(I18Keys.publish)}
              style={{ width: '100%' }}></AppButton>
          </Box>
        </Box>
      );
    }

    if (current.statuses.live && !update.enabledEdit) {
      return (
        <Box direction="row" gap="small" margin={{ top: 'medium' }}>
          <Box width="50%" style={{ flexGrow: 1 }}>
            <AppButton
              disabled={update.isUpdating || publish.isRetracting}
              icon={<ClearIcon></ClearIcon>}
              onClick={() => setUnpublishIntent(true)}
              label={t(I18Keys.unpublish)}></AppButton>
          </Box>
          <Box width="50%" align="end" gap="small">
            <AppButton
              primary
              disabled={update.isUpdating || publish.isRetracting}
              icon={<SendIcon></SendIcon>}
              onClick={() => enableEditOrUpdate()}
              label={t(I18Keys.edit)}
              style={{ width: '100%' }}></AppButton>
          </Box>
        </Box>
      );
    }

    if (current.statuses.live && update.enabledEdit) {
      return (
        <Box direction="row" gap="small" margin={{ top: 'medium' }}>
          <Box width="50%" style={{ flexGrow: 1 }}>
            <AppButton
              disabled={update.isUpdating}
              icon={<ClearIcon></ClearIcon>}
              onClick={() => cancelEdit()}
              label={t(I18Keys.cancel)}></AppButton>
          </Box>
          <Box width="50%" align="end" gap="small">
            <AppButton
              primary
              disabled={update.isUpdating}
              icon={<SendIcon></SendIcon>}
              onClick={() => enableEditOrUpdate()}
              label={t(I18Keys.publish)}
              style={{ width: '100%' }}></AppButton>
          </Box>
        </Box>
      );
    }

    return <></>;
  })();

  const editable = update.editable;
  const hideSemantics = hideSemanticsHelper(current.post);

  const content = (() => {
    if (!current.post) {
      return (
        <Box gap="12px" pad="medium">
          <LoadingDiv height="90px" width="100%"></LoadingDiv>
          <LoadingDiv height="200px" width="100%"></LoadingDiv>
          <LoadingDiv height="120px" width="100%"></LoadingDiv>
        </Box>
      );
    }

    const patternProps: PatternProps = {
      isLoading: current.statuses.isParsing,
      editable,
      semantics: current.post.semantics,
      originalParsed: current.post.originalParsed,
      semanticsUpdated: semanticsUpdated,
    };

    return (
      <>
        <Box pad="medium">
          <PostHeader margin={{ bottom: '16px' }}></PostHeader>
          {!hideSemantics && (
            <SemanticsEditor
              patternProps={patternProps}
              include={[PATTERN_ID.KEYWORDS]}></SemanticsEditor>
          )}

          <PostTextEditable text={postText}></PostTextEditable>

          {!hideSemantics && (
            <SemanticsEditor
              patternProps={patternProps}
              include={[PATTERN_ID.REF_LABELS]}></SemanticsEditor>
          )}

          {action}
        </Box>
      </>
    );
  })();

  return (
    <ViewportPage
      content={
        <Box fill>
          <PostNav></PostNav>
          {content}
        </Box>
      }></ViewportPage>
  );
};
