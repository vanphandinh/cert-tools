const crypto = require('crypto')
const jsonld = require('jsonld')
const ContextsMap = require('./contexts')
const sha256 = require('sha256')

const createIso8601String = () => {
    let iso8601 = new Date().toISOString()
    iso8601 = iso8601.slice(0, -1) + '+00:00'
    return iso8601
}

const toSHA256 = stringData => {
    const hash = crypto.createHash('sha256')
    hash.update(stringData)
    return hash.digest('hex')
}

const customDocumentLoader = () => {
    console.log('begin doc loader...')
    // define a mapping of context URL => context doc
    const {
        obi: OBI_CONTEXT,
        blockcerts: BLOCKCERTS_CONTEXT,
        blockcertsv1_2: BLOCKCERTSV1_2_CONTEXT,
        blockcertsv2: BLOCKCERTSV2_CONTEXT,
        blockcertsV3: BLOCKCERTSV3_CONTEXT,
        verifiableCredential: VERIFIABLE_CREDENTIAL_CONTEXT,
        verifiableCredentialExample: VERIFIABLE_CREDENTIAL_EXAMPLE,
        merkleProof2019: MERKLE_PROOF_2019,
    } = ContextsMap
    const CONTEXTS = {}
    // Preload contexts
    CONTEXTS[
        'https://w3id.org/blockcerts/schema/2.0-alpha/context.json'
    ] = BLOCKCERTS_CONTEXT
    CONTEXTS[
        'https://www.blockcerts.org/schema/2.0-alpha/context.json'
    ] = BLOCKCERTS_CONTEXT
    CONTEXTS['https://w3id.org/openbadges/v2'] = OBI_CONTEXT
    CONTEXTS['https://openbadgespec.org/v2/context.json'] = OBI_CONTEXT
    CONTEXTS['https://w3id.org/blockcerts/v2'] = BLOCKCERTSV2_CONTEXT
    CONTEXTS[
        'https://www.w3id.org/blockcerts/schema/2.0/context.json'
    ] = BLOCKCERTSV2_CONTEXT
    CONTEXTS['https://w3id.org/blockcerts/v1'] = BLOCKCERTSV1_2_CONTEXT

    // V3
    CONTEXTS[
        'https://www.blockcerts.org/schema/3.0-alpha/context.json'
    ] = BLOCKCERTSV3_CONTEXT
    CONTEXTS[
        'https://w3id.org/blockcerts/schema/3.0-alpha/context.json'
    ] = BLOCKCERTSV3_CONTEXT
    CONTEXTS[
        'https://www.w3.org/2018/credentials/v1'
    ] = VERIFIABLE_CREDENTIAL_CONTEXT
    CONTEXTS[
        'https://www.w3.org/2018/credentials/examples/v1'
    ] = VERIFIABLE_CREDENTIAL_EXAMPLE
    CONTEXTS[
        'https://w3id.org/blockcerts/schema/3.0-alpha/merkleProof2019Context.json'
    ] = MERKLE_PROOF_2019
    CONTEXTS[
        'https://www.blockcerts.org/schema/3.0-alpha/merkleProof2019Context.json'
    ] = MERKLE_PROOF_2019

    // grab the built-in node.js doc loader
    const nodeDocumentLoader = jsonld.documentLoaders.node()
    // or grab the XHR one: jsonld.documentLoaders.xhr()

    // change the default document loader
    const customLoader = async (url, options) => {
        if (url in CONTEXTS) {
            return {
                contextUrl: null, // this is for a context via a link header
                document: CONTEXTS[url], // this is the actual document that was loaded
                documentUrl: url, // this is the actual context URL after redirects
            }
        }
        // call the default documentLoader
        return nodeDocumentLoader(url, options)
    }
    jsonld.documentLoader = customLoader
    console.log('end doc loader...')
}

const computeHash = jsonData => {
    customDocumentLoader()
    const options = {
        algorithm: 'URDNA2015',
        format: 'application/n-quads',
    }
    console.log('begin normalize...')
    return new Promise((resolve, reject) => {
        jsonld
            .canonize(jsonData, options)
            .then(result => {
                resolve(sha256(toUTF8Data(result)))
            })
            .catch(reject)
    })
}

const toUTF8Data = string => {
    const utf8 = []
    for (let i = 0; i < string.length; i++) {
        let charcode = string.charCodeAt(i)
        if (charcode < 0x80) {
            utf8.push(charcode)
        } else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f))
        } else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(
                0xe0 | (charcode >> 12),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f)
            )
        } else {
            // surrogate pair
            i++
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode =
                0x10000 +
                (((charcode & 0x3ff) << 10) | (string.charCodeAt(i) & 0x3ff))
            utf8.push(
                0xf0 | (charcode >> 18),
                0x80 | ((charcode >> 12) & 0x3f),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f)
            )
        }
    }
    return utf8
}

module.exports = {
    createIso8601String,
    toSHA256,
    computeHash,
}
