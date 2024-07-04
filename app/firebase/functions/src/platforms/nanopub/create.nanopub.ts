import { Nanopub } from '@nanopub/sign';
import { DataFactory, Store, Writer } from 'n3';

import { AppPostFull } from '../../@shared/types/types.posts';
import { TwitterUserDetails } from '../../@shared/types/types.twitter';
import { AppUser, PLATFORM } from '../../@shared/types/types.user';
import { parseRDF } from '../../@shared/utils/n3.utils';
import { logger } from '../../instances/logger';
import { PostsHelper } from '../../posts/posts.helper';
import { UsersHelper } from '../../users/users.helper';

const DEBUG = false;

export const createNanopublication = async (
  post: AppPostFull,
  user: AppUser
) => {
  const semantics = post.semantics;
  const content = PostsHelper.concatenateThread(post);
  const twitter = UsersHelper.getAccount(
    user,
    PLATFORM.Twitter,
    undefined,
    true
  ) as TwitterUserDetails;
  const twitterUsername = twitter.profile?.username;
  const twitterName = twitter.profile?.name;

  if (!twitterUsername) {
    throw new Error('Twitter username not found');
  }

  if (!twitterName) {
    throw new Error('Twitter name not found');
  }

  const originalPlatformPost = post.mirrors.find(
    (platformPost) => platformPost.platformId === PLATFORM.Twitter
  )?.posted;

  const originalPlatformPostId = originalPlatformPost?.post_id;

  if (!originalPlatformPostId) {
    throw new Error('Original platform post id not found');
  }

  const twitterPath = `${twitterUsername}`;

  if (DEBUG)
    logger.debug(`Creating nanopub twitterPath:${twitterPath}`, {
      twitterPath,
    });

  const semanticsStore = await (async () => {
    if (!semantics) return new Store();

    return await parseRDF(semantics);
  })();

  const nanoDetails = user[PLATFORM.Nanopub];
  const ethAddress = nanoDetails && nanoDetails[0].profile?.ethAddress;
  if (!ethAddress) {
    throw new Error('Eth address not found');
  }

  const orcidDetails = user[PLATFORM.Orcid];
  const orcidId = orcidDetails && orcidDetails[0].user_id;
  const tweetUrl = `https://twitter.com/${twitterPath}/status/${originalPlatformPostId}`;

  return await buildSpostNp(
    ethAddress,
    orcidId as string,
    twitterUsername,
    'sup', // hardcoded for now. Update to get from post
    twitterName,
    semanticsStore,
    content,
    tweetUrl
  );
  // /** Then get the RDF as triplets */
  // const assertionsStore = await (async () => {
  //   if (!semantics) return new Store();

  //   const store = await parseRDF(semantics);

  //   /** Manipulate assertion semantics on the N3 store */

  //   /** replace THIS_POST_NAME node with the nanopub:assertion node */
  //   const assertionsStore = replaceNodes(store, {
  //     [THIS_POST_NAME]: ASSERTION_URI,
  //   });

  //   return assertionsStore;
  // })();

  // /** Add the post context as a comment of the assertion */
  // assertionsStore.addQuad(
  //   DataFactory.namedNode(ASSERTION_URI),
  //   DataFactory.namedNode(HAS_COMMENT_URI),
  //   DataFactory.literal(content),
  //   DataFactory.defaultGraph()
  // );

  // /** Then get the RDF as triplets */
  // const assertionsRdf = await writeRDF(assertionsStore);

  // /** append the npx:ExampleNanopub (manually for now) */
  // const exampleTriplet = `: a npx:ExampleNanopub .`;

  // const semanticPostTriplet = `: a <https://sense-nets.xyz/SemanticPost> .`;

  // /** append the data related to the author (including) identity */
  // const nanoDetails = user[PLATFORM.Nanopub];
  // const hasEthSigner = nanoDetails !== undefined;
  // const address = nanoDetails && nanoDetails[0].profile?.ethAddress;

  // const ethSignerRdf = hasEthSigner
  //   ? `
  //           : <http://sense-nets.xyz/rootSigner> "${address}" .
  //       `
  //   : '';

  // if (DEBUG) logger.debug(`Creating nanopub`, { ethSignerRdf });

  // const rdfStr = `
  //         @prefix : <${NANOPUB_PLACEHOLDER}> .
  //         @prefix np: <http://www.nanopub.org/nschema#> .
  //         @prefix npx: <http://purl.org/nanopub/x/> .
  //         @prefix dct: <http://purl.org/dc/terms/> .
  //         @prefix twitter: <https://twitter.com/> .
  //         @prefix prov: <http://www.w3.org/ns/prov#> .

  //         :Head {
  //           : np:hasAssertion :assertion ;
  //             np:hasProvenance :provenance ;
  //             np:hasPublicationInfo :pubinfo ;
  //             a np:Nanopublication .
  //         }

  //         :assertion {
  //           :assertion dct:creator twitter:${twitterUsername} .
  //           ${assertionsRdf}
  //         }

  //         :provenance {
  //           :assertion prov:wasAttributedTo twitter:${twitterUsername} .
  //           :assertion prov:wasDerivedFrom twitter:${twitterPath} .
  //         }

  //         :pubinfo {
  //           ${hasEthSigner ? ethSignerRdf : ''}
  //           ${exampleTriplet}
  //           ${semanticPostTriplet}
  //         }
  //       `;

  // try {
  //   if (DEBUG)
  //     logger.debug(`Creating nanopub rdfStr:${rdfStr.slice(0, 320)}`, {
  //       rdfStr,
  //     });
  //   const np = new Nanopub(rdfStr);

  //   if (DEBUG) logger.debug(`Created nanopub!`);
  //   return np;
  // } catch (e: any) {
  //   logger.error(e);
  //   throw new Error(`Error creating nanopub: ${e}`);
  // }
};

// import { DataFactory, Store, Quad, NamedNode, Writer } from 'n3';
// import { Nanopub, NpProfile } from '@nanopub/sign';

const { namedNode, quad, literal } = DataFactory;

// Define the function
export const sendTriplets = (): Store => {
  // Create a store
  const store = new Store();

  // Create a simple triple with a literal as the object
  store.addQuad(
    quad(
      namedNode('http://example.org/mosquito'),
      namedNode('http://example.org/hasLabel'),
      literal('Mosquito')
    )
  );

  return store;
};

export const buildSpostProv = (
  postType: string,
  orcidId: string,
  twitterHandle: string,
  tweetUrl: string
): Store => {
  // Create a store
  const store = new Store();

  // Define the graph URI
  const PROVENANCE_URI = 'http://purl.org/nanopub/temp/mynanopub#provenance';
  const provenanceGraphUri = namedNode(PROVENANCE_URI);

  // Define the subjects, predicates, and objects
  const cosmo = namedNode('https://sense-nets.xyz/');
  const xHandle = namedNode('https://x.com/' + twitterHandle);
  const assertion = namedNode(
    'http://purl.org/nanopub/temp/mynanopub#assertion'
  );
  const activity = namedNode('http://purl.org/nanopub/temp/mynanopub#activity');

  // Add quads to the store based on post_type
  const activityType =
    postType === 'sup'
      ? namedNode('https://sense-nets.xyz/supervisedActivity')
      : namedNode('https://sense-nets.xyz/unsupervisedActivity');

  store.addQuad(
    quad(
      cosmo,
      namedNode('http://www.w3.org/ns/prov#actedOnBehalfOf'),
      xHandle,
      provenanceGraphUri
    )
  );
  store.addQuad(
    quad(
      cosmo,
      namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      namedNode('http://www.w3.org/ns/prov#SoftwareAgent'),
      provenanceGraphUri
    )
  );
  store.addQuad(
    quad(
      activity,
      namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      activityType,
      provenanceGraphUri
    )
  );
  store.addQuad(
    quad(
      activity,
      namedNode('http://www.w3.org/ns/prov#wasAssociatedWith'),
      cosmo,
      provenanceGraphUri
    )
  );
  store.addQuad(
    quad(
      assertion,
      namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
      xHandle,
      provenanceGraphUri
    )
  );
  store.addQuad(
    quad(
      assertion,
      namedNode('http://www.w3.org/ns/prov#wasGeneratedBy'),
      activity,
      provenanceGraphUri
    )
  );
  store.addQuad(
    quad(
      assertion,
      namedNode('http://www.w3.org/ns/prov#linksTo'),
      namedNode(tweetUrl),
      provenanceGraphUri
    )
  );

  // If ORCID ID exists, add it to the provenance graph
  if (orcidId) {
    const orcidNode = namedNode('https://orcid.org/' + orcidId);
    store.addQuad(
      quad(
        assertion,
        namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
        orcidNode,
        provenanceGraphUri
      )
    );
    store.addQuad(
      quad(
        xHandle,
        namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
        orcidNode,
        provenanceGraphUri
      )
    );
  }

  return store;
};

export const buildSpostAssertion = (
  semanticsStore: Store,
  twitterHandle: string,
  postText: string
): Store => {
  // Define the graph URI
  const ASSERTION_URI = 'http://purl.org/nanopub/temp/mynanopub#assertion';
  const assertionGraphUri = namedNode(ASSERTION_URI);

  // Create a new store for the assertion
  const store = new Store();
  //attributing the assertion to twitter user
  store.addQuad(
    assertionGraphUri,
    namedNode('http://www.w3.org/2000/01/rdf-schema#comment'),
    literal(postText),
    assertionGraphUri
  );

  // Add quads from the semantics store to the assertion store with the graph URI
  semanticsStore.getQuads(null, null, null, null).forEach((parsedQuad) => {
    const newQuad = quad(
      parsedQuad.subject,
      parsedQuad.predicate,
      parsedQuad.object,
      assertionGraphUri
    );
    store.addQuad(newQuad);
  });

  store.addQuad(
    assertionGraphUri,
    namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
    namedNode('https://x.com/' + twitterHandle),
    assertionGraphUri
  );

  return store;
};

export const buildSpostPubinfo = (
  ethAddress: string,
  orcidId: string,
  twitterHandle: string,
  postType: string,
  name: string
): Store => {
  const BASE_URI = 'http://purl.org/nanopub/temp/mynanopub#';
  const baseGraphUri = namedNode(BASE_URI);
  const pubinfoGraphUri = namedNode(BASE_URI + 'pubinfo');
  const xHandle = namedNode('https://x.com/' + twitterHandle);

  // Create a new store for the assertion
  const store = new Store();
  //adding constant triplets
  store.addQuad(
    xHandle,
    namedNode('http://xmlns.com/foaf/0.1/name'),
    literal(name),
    pubinfoGraphUri
  );
  // If ORCID ID exists, add it to the provenance graph
  if (orcidId) {
    const orcidNode = namedNode('https://orcid.org/' + orcidId);
    store.addQuad(
      quad(
        orcidNode,
        namedNode('http://xmlns.com/foaf/0.1/name'),
        literal(name),
        pubinfoGraphUri
      )
    );
    store.addQuad(
      quad(
        baseGraphUri,
        namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
        orcidNode,
        pubinfoGraphUri
      )
    );
  }

  store.addQuad(
    baseGraphUri,
    namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
    namedNode('https://x.com/' + twitterHandle),
    pubinfoGraphUri
  );
  store.addQuad(
    baseGraphUri,
    namedNode('http://purl.org/nanopub/x/hasNanopubType'),
    namedNode('https://sense-nets.xyz/SemanticPost'),
    pubinfoGraphUri
  );
  store.addQuad(
    baseGraphUri,
    namedNode('http://purl.org/nanopub/x/wasCreatedAt'),
    namedNode('https://sense-nets.xyz/'),
    pubinfoGraphUri
  );
  store.addQuad(
    baseGraphUri,
    namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    literal('CoSMO Semantic Post'),
    pubinfoGraphUri
  );
  store.addQuad(
    baseGraphUri,
    namedNode('https://sense-nets.xyz/hasRootSigner'),
    literal(ethAddress),
    pubinfoGraphUri
  );
  //if post type is unsupervised then add
  if (postType == 'unsup') {
    store.addQuad(
      quad(
        namedNode(BASE_URI + 'sig'),
        namedNode('http://purl.org/nanopub/x/singedBy'),
        namedNode('https://sense-nets.xyz/'),
        pubinfoGraphUri
      )
    );
  }
  return store;
};

export const buildNpHead = (): Store => {
  // build nanopub head
  const headStore = new Store();
  const BASE_URI = 'http://purl.org/nanopub/temp/mynanopub#';
  const baseGraphUri = namedNode(BASE_URI);
  const headGraphUri = namedNode(BASE_URI + 'head');

  headStore.addQuad(
    baseGraphUri,
    namedNode('http://www.nanopub.org/nschema#hasAssertion'),
    namedNode(BASE_URI + 'assertion'),
    headGraphUri
  );
  headStore.addQuad(
    baseGraphUri,
    namedNode('http://www.nanopub.org/nschema#hasProvenance'),
    namedNode(BASE_URI + 'provenance'),
    headGraphUri
  );

  headStore.addQuad(
    baseGraphUri,
    namedNode('http://www.nanopub.org/nschema#hasPublicationInfo'),
    namedNode(BASE_URI + 'pubinfo'),
    headGraphUri
  );
  headStore.addQuad(
    baseGraphUri,
    namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    namedNode('http://www.nanopub.org/nschema#Nanopublication'),
    headGraphUri
  );

  return headStore;
};

export const buildSpostNp = async (
  ethAddress: string,
  orcidId: string,
  twitterHandle: string,
  postType: string,
  name: string,
  semantics: Store,
  postText: string,
  tweetUrl: string
  // privateKey: string
): Promise<Nanopub> => {
  return new Promise((resolve, reject) => {
    const assertionStore = buildSpostAssertion(
      semantics,
      twitterHandle,
      postText
    );
    const provStore = buildSpostProv(
      postType,
      orcidId,
      twitterHandle,
      tweetUrl
    );
    const pubinfoStore = buildSpostPubinfo(
      ethAddress,
      orcidId,
      twitterHandle,
      postType,
      name
    );
    const headStore = buildNpHead();

    // Create a writer and add prefixes
    const writer = new Writer({ format: 'application/trig' });
    writer.addPrefixes({
      base: 'http://purl.org/nanopub/temp/mynanopub#',
      cosmo: 'https://sense-nets.xyz/',
      dct: 'http://purl.org/dc/terms/',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      ns1: 'http://purl.org/np/',
      foaf: 'http://xmlns.com/foaf/0.1/',
      schema: 'https://schema.org/',
      x: 'https://x.com/',
      np: 'http://www.nanopub.org/nschema#',
      npx: 'http://purl.org/nanopub/x/',
      prov: 'http://www.w3.org/ns/prov#',
      orcid: 'https://orcid.org/',
    });

    headStore
      .getQuads(
        null,
        null,
        null,
        namedNode('http://purl.org/nanopub/temp/mynanopub#head')
      )
      .forEach((quad) => {
        writer.addQuad(quad);
      });

    // Add quads from the store to the writer
    assertionStore
      .getQuads(
        null,
        null,
        null,
        namedNode('http://purl.org/nanopub/temp/mynanopub#assertion')
      )
      .forEach((quad) => {
        writer.addQuad(quad);
      });

    // Add quads from the store to the writer
    provStore
      .getQuads(
        null,
        null,
        null,
        namedNode('http://purl.org/nanopub/temp/mynanopub#provenance')
      )
      .forEach((quad) => {
        writer.addQuad(quad);
      });

    // Add quads from the store to the writer
    pubinfoStore
      .getQuads(
        null,
        null,
        null,
        namedNode('http://purl.org/nanopub/temp/mynanopub#pubinfo')
      )
      .forEach((quad) => {
        writer.addQuad(quad);
      });

    // End the writer and display the TriG content
    writer.end(async (error, result) => {
      if (error) {
        console.error('Error writing the TriG data:', error);
        reject(error);
      } else {
        console.log('TriG data:', result);

        try {
          const np = new Nanopub(result);
          resolve(np);
        } catch (e) {
          console.error('Error creating or publishing Nanopub:', e);
          reject(e);
        }
      }
    });
  });
};
