import { Box, Text } from 'grommet';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { NavButton } from '../app/NavButton';
import { useToastContext } from '../app/ToastsContext';
import { HomeIcon } from '../app/icons/HomeIcon';
import { LeftIcon } from '../app/icons/LeftIcon';
import { RightIcon } from '../app/icons/RightIcon';
import { AppPostFull } from '../shared/types/types.posts';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { Loading } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useUserPosts } from '../user-home/UserPostsContext';
import { usePost } from './PostContext';

const getNextAndPrev = (postId?: string, posts?: AppPostFull[]) => {
  if (!posts || !postId) {
    return {};
  }

  const currPostIndex = posts?.findIndex((p) => p.id === postId);
  const prevPostId =
    posts && currPostIndex != undefined && currPostIndex > 0
      ? posts[currPostIndex - 1].id
      : undefined;

  const nextPostId =
    posts && currPostIndex != undefined && currPostIndex < posts.length - 1
      ? posts[currPostIndex + 1].id
      : undefined;

  return { prevPostId, nextPostId };
};

export const PostNav = (props: {
  profile?: TwitterUserProfile;
  isProfile: boolean;
}) => {
  const { show } = useToastContext();
  const profile = props.profile;
  const { post } = usePost();
  const { fetchOlder, posts, isFetchingOlder, errorFetchingOlder } =
    useUserPosts();
  const navigate = useNavigate();
  const { constants } = useThemeContext();

  const { prevPostId, nextPostId } = useMemo(
    () => getNextAndPrev(post?.id, posts),
    [post, posts]
  );

  useEffect(() => {
    if (errorFetchingOlder) {
      show({
        title: 'Error getting users posts',
        message: errorFetchingOlder.message.includes('429')
          ? "Too many requests to Twitter's API. Please retry in 10-15 minutes"
          : errorFetchingOlder.message,
      });
    }
  }, [errorFetchingOlder]);

  useEffect(() => {
    if (!nextPostId && !isFetchingOlder && !errorFetchingOlder) {
      fetchOlder();
    }
  }, [isFetchingOlder, nextPostId]);

  const goToPrev = () => {
    navigate(`/post/${prevPostId}`);
  };

  const goToNext = () => {
    if (nextPostId) {
      navigate(`/post/${nextPostId}`);
    }
  };

  return (
    <Box
      style={{
        height: '40px',
        borderBottom: '1px solid #F3F4F6',
        backgroundColor: constants.colors.shade,
      }}
      pad={{ horizontal: '12px' }}
      direction="row"
      justify="between">
      <NavButton
        icon={props.isProfile ? <LeftIcon></LeftIcon> : <HomeIcon></HomeIcon>}
        label={props.isProfile ? 'Back' : 'Home'}
        onClick={() => (profile ? navigate('..') : navigate('/'))}></NavButton>
      {!props.isProfile ? (
        <Box direction="row" gap="8px">
          <NavButton
            icon={<LeftIcon></LeftIcon>}
            disabled={!prevPostId}
            label="Previous"
            onClick={() => goToPrev()}></NavButton>
          <NavButton
            reverse
            icon={
              isFetchingOlder ? <Loading></Loading> : <RightIcon></RightIcon>
            }
            disabled={!nextPostId}
            label="Next"
            onClick={() => goToNext()}></NavButton>
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
};
