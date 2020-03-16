const CONSTANTS = {
    CONTEXTS: {
        OPEN_BADGES_V2_CONTEXT_JSON: 'https://w3id.org/openbadges/v2',
        BLOCKCERTS_V2_CONTEXT_JSON: 'https://w3id.org/blockcerts/v2',
    },
    TYPES: {
        PROFILE: 'Profile',
        REVOCATION_LIST: 'RevocationList',
        BADGE: 'BadgeClass',
        CERTIFICATION: 'Assertion',
        MERKLE_PROOF_VERIFICATION_2017: 'MerkleProofVerification2017',
        EXTENSION: 'Extension',
        SIGNATURE_LINE: 'SignatureLine',
    },
    PREFIXS: {
        URN_UUID: 'urn:uuid:',
        PNG: 'data:image/png;base64,',
        PUBKEY: 'ecdsa-koblitz-pubkey:',
    },
    COLLECTIONS: {
        BADGE_TEMPLATES: 'badge_templates',
        CERTIFICATION_TEMPLATES: 'certification_templates',
        ISSUERS: 'issuers',
        ISSUER_TEMPLATES: 'issuer_templates',
        REVOCATIONS: 'revocations',
    },
}

module.exports = CONSTANTS
