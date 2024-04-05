import init, { Nanopub } from '@nanopub/sign';
import { DataFactory, Store } from 'n3';

import { parseRDF, replaceNodes, writeRDF } from '../shared/n3.utils';
import {
  ASSERTION_URI,
  HAS_COMMENT_URI,
  NANOPUB_PLACEHOLDER,
  THIS_POST_NAME,
} from '../shared/semantics.helper';
import { AppUserRead, PLATFORM } from '../shared/types';
import { AppPostSemantics } from '../shared/types.parser';

export const constructPostNanopub = async (
  content: string,
  user: AppUserRead,
  semantics?: AppPostSemantics
): Promise<Nanopub> => {
  await (init as any)();

  /** Then get the RDF as triplets */
  const assertionsStore = await (async () => {
    if (!semantics) return new Store();

    const store = await parseRDF(semantics);

    /** Manipulate assertion semantics on the N3 store */

    /** replace THIS_POST_NAME node with the nanopub:assertion node */
    const assertionsStore = replaceNodes(store, {
      [THIS_POST_NAME]: ASSERTION_URI,
    });

    return assertionsStore;
  })();

  /** Add the post context as a comment of the assertion */
  assertionsStore.addQuad(
    DataFactory.namedNode(ASSERTION_URI),
    DataFactory.namedNode(HAS_COMMENT_URI),
    DataFactory.literal(content),
    DataFactory.defaultGraph()
  );

  /** Then get the RDF as triplets */
  const assertionsRdf = await writeRDF(assertionsStore);

  /** append the npx:ExampleNanopub (manually for now) */
  const exampleTriplet = `: a npx:ExampleNanopub .`;

  const semanticPostTriplet = `: a <https://sense-nets.xyz/SemanticPost> .`;

  /** append the data related to the author (including) identity */
  const orcid = user.orcid && user.orcid[0].user_id;

  const nanoDetails = user[PLATFORM.Nanopubs];
  const hasEthSigner = nanoDetails !== undefined;
  const address = nanoDetails && nanoDetails[0].profile?.ethAddress;

  const ethSignerRdf = hasEthSigner
    ? `
      : <http://sense-nets.xyz/rootSigner> "${address}" .
  `
    : '';

  const rdfStr = `
    @prefix : <${NANOPUB_PLACEHOLDER}> .
    @prefix np: <http://www.nanopub.org/nschema#> .
    @prefix dct: <http://purl.org/dc/terms/> .
    @prefix nt: <https://w3id.org/np/o/ntemplate/> .
    @prefix npx: <http://purl.org/nanopub/x/> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix orcid: <https://orcid.org/> .
    @prefix ns1: <http://purl.org/np/> .
    @prefix prov: <http://www.w3.org/ns/prov#> .
    @prefix foaf: <http://xmlns.com/foaf/0.1/> .
    
    :Head {
      : np:hasAssertion :assertion ;
        np:hasProvenance :provenance ;
        np:hasPublicationInfo :pubinfo ;
        a np:Nanopublication .
    }
    
    :assertion {
      :assertion dct:creator orcid:${orcid} .
      ${assertionsRdf}
    }
    
    
    :provenance {
      :assertion prov:wasAttributedTo orcid:${orcid} .
    }
    
    :pubinfo {
      ${hasEthSigner ? ethSignerRdf : ''}      
      ${exampleTriplet}
      ${semanticPostTriplet}
    }
  `;

  const np = new Nanopub(rdfStr);
  return np;
};
