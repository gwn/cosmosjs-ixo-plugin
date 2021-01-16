const
    crypto = require('crypto'),
    sovrin = require('sovrin-did'),
    bip39 = require('bip39'),
    base58 = require('bs58'),
    bech32 = require('bech32')


const ixoify = cosmosjsClient => Object.assign(cosmosjsClient, {
    getDid(mnemonic) {
        const seed = crypto.createHash('sha256').update(mnemonic).digest('hex')
        const didSeed = new Uint8Array(32)

        for (let i = 0; i < 32; ++i)
            didSeed[i] = parseInt(seed.substring(i * 2, i * 2 + 2), 16)

        return sovrin.fromSeed(didSeed)
    },

    getClaimsAddress(mnemonic, checkSum = true) {
        if (checkSum && !bip39.validateMnemonic(mnemonic))
            throw new Error('mnemonic phrases have invalid checksums')

        const ixoDid = this.getDid(mnemonic)

        const verifyKey =
            crypto.createHash('sha256')
                .update(base58.decode(ixoDid.verifyKey))
                .digest()
                .slice(0, 20)

        return bech32.encode(this.bech32MainPrefix, bech32.toWords(verifyKey))
    },

    // @param modeType: sync | async | block
    //     sync: return after CheckTx
    //     async: return right away
    //     block: return after tx commit
    signClaim(stdSignMsg, did, modeType = 'sync') {
        const
            signMessage = stdSignMsg.json,
            signObj =
                sovrin.signMessage(
                    JSON.stringify(sortObject(signMessage)),
                    did.secret.signKey,
                    did.verifyKey,
                ),
            signature =
                Buffer.from(signObj, 'binary').slice(0, 64).toString('base64')

        return {
            tx: {
                msg: stdSignMsg.json.msgs,
                fee: stdSignMsg.json.fee,
                memo: stdSignMsg.json.memo,
                signatures: [{
                    account_number: stdSignMsg.json.account_number,
                    sequence: stdSignMsg.json.sequence,
                    signature: signature,
                    pub_key: {
                        type: 'tendermint/PubKeyEd25519',
                        value: base58ToBase64(did.verifyKey),
                    },
                }],
            },

            mode: modeType,
        }
    },
})

const base58ToBase64 = text => base58.decode(text).toString('base64')

const sortObject = obj => {
    if (obj === null) return null
    if (typeof obj !== 'object') return obj
    if (Array.isArray(obj)) return obj.map(sortObject)

    const sortedKeys = Object.keys(obj).sort()
    const result = {}
    sortedKeys.forEach(key => {
        result[key] = sortObject(obj[key]) })
    return result
}


module.exports = ixoify
