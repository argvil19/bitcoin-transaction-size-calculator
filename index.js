class BtcSizeFeeEstimator {
  constructor() {
    this.P2PKH_IN_SIZE = 148
    this.P2PKH_OUT_SIZE = 34
    this.P2SH_OUT_SIZE = 32
    this.P2SH_P2WPKH_OUT_SIZE = 32
    this.P2SH_P2WSH_OUT_SIZE = 32
    this.P2SH_P2WPKH_IN_SIZE = 91
    this.P2WPKH_IN_SIZE = 67.75
    this.P2WPKH_OUT_SIZE = 31
    this.P2WSH_OUT_SIZE = 43
    this.P2TR_OUT_SIZE = 43
    this.P2TR_IN_SIZE = 57.25
    this.PUBKEY_SIZE = 33
    this.SIGNATURE_SIZE = 72
    this.SUPPORTED_INPUT_SCRIPT_TYPES = ['P2PKH', 'P2SH', 'P2SH-P2WPKH', 'P2SH-P2WSH', 'P2WPKH', 'P2WSH', 'P2TR']

    this.defaultParams = {
      input_count: 0,
      input_script: 'P2PKH',
      input_m: 0,
      input_n: 0,
      p2pkh_output_count: 0,
      p2sh_output_count: 0,
      p2sh_p2wpkh_output_count: 0,
      p2sh_p2wsh_output_count: 0,
      p2wpkh_output_count: 0,
      p2wsh_output_count: 0,
      p2tr_output_count: 0
    }
    this.inputOpts = {}
  }

  getSizeOfScriptLengthElement(length) {
    if (length < 75) {
      return 1
    } else if (length <= 255) {
      return 2
    } else if (length <= 65535) {
      return 3
    } else if (length <= 4294967295) {
      return 5
    } else {
      throw new Error('Size of redeem script is too large')
    }
  }

  getSizeOfVarInt(length) {
    if (length < 253) {
      return 1
    } else if (length < 65535) {
      return 3
    } else if (length < 4294967295) {
      return 5
    } else if (length < 18446744073709551615) {
      return 9
    } else {
      throw new Error('Invalid var int')
    }
  }

  getTxOverheadVBytes(input_script, input_count, output_count) {
    var witness_vbytes
    if (input_script === 'P2PKH' || input_script === 'P2SH') {
      witness_vbytes = 0
    } else { // Transactions with segwit inputs have extra overhead
      witness_vbytes = 0.25 // segwit marker
        + 0.25 // segwit flag
        + this.getSizeOfVarInt(input_count) / 4 // witness element count
    }

    return 4 // nVersion
      + this.getSizeOfVarInt(input_count) // number of inputs
      + this.getSizeOfVarInt(output_count) // number of outputs
      + 4 // nLockTime
      + witness_vbytes
  }

  getTxOverheadExtraRawBytes(input_script, input_count) {
    var witness_vbytes
    if (input_script === 'P2PKH' || input_script === 'P2SH') {
      witness_vbytes = 0
    } else { // Transactions with segwit inputs have extra overhead
      witness_vbytes = 0.25 // segwit marker
        + 0.25 // segwit flag
        + this.getSizeOfVarInt(input_count) / 4 // witness element count
    }

    return witness_vbytes * 3
  }

  prepareParams(opts) {
    // Verify opts and set them to this.params
    opts = opts || Object.assign(this.defaultParams)

    var input_count = parseInt(opts.input_count || this.defaultParams.input_count)
    if (!Number.isInteger(input_count) || input_count < 0) {
      throw new Error('expecting positive input count, got: ' + input_count)
    }

    var input_script = opts.input_script || this.defaultParams.input_script
    if (this.SUPPORTED_INPUT_SCRIPT_TYPES.indexOf(input_script) === -1) {
      throw new Error('Not supported input script type')
    }

    var input_m = parseInt(opts.input_m || this.defaultParams.input_m)
    if (!Number.isInteger(input_m) || input_m < 0) {
      throw new Error('expecting positive signature count')
    }

    var input_n = parseInt(opts.input_n || this.defaultParams.input_n)
    if (!Number.isInteger(input_n) || input_n < 0) {
      throw new Error('expecting positive pubkey count')
    }

    var p2pkh_output_count = parseInt(opts.p2pkh_output_count || this.defaultParams.p2pkh_output_count)
    if (!Number.isInteger(p2pkh_output_count) || p2pkh_output_count < 0) {
      throw new Error('expecting positive p2pkh output count')
    }

    var p2sh_output_count = parseInt(opts.p2sh_output_count || this.defaultParams.p2sh_output_count)
    if (!Number.isInteger(p2sh_output_count) || p2sh_output_count < 0) {
      throw new Error('expecting positive p2sh output count')
    }

    var p2sh_p2wpkh_output_count = parseInt(opts.p2sh_p2wpkh_output_count || this.defaultParams.p2sh_p2wpkh_output_count)
    if (!Number.isInteger(p2sh_p2wpkh_output_count) || p2sh_p2wpkh_output_count < 0) {
      throw new Error('expecting positive p2sh-p2wpkh output count')
    }

    var p2sh_p2wsh_output_count = parseInt(opts.p2sh_p2wsh_output_count || this.defaultParams.p2sh_p2wsh_output_count)
    if (!Number.isInteger(p2sh_p2wsh_output_count) || p2sh_p2wsh_output_count < 0) {
      throw new Error('expecting positive p2sh-p2wsh output count')
    }

    var p2wpkh_output_count = parseInt(opts.p2wpkh_output_count || this.defaultParams.p2wpkh_output_count)
    if (!Number.isInteger(p2wpkh_output_count) || p2wpkh_output_count < 0) {
      throw new Error('expecting positive p2wpkh output count')
    }

    var p2wsh_output_count = parseInt(opts.p2wsh_output_count || this.defaultParams.p2wsh_output_count)
    if (!Number.isInteger(p2wsh_output_count) || p2wsh_output_count < 0) {
      throw new Error('expecting positive p2wsh output count')
    }

    var p2tr_output_count = parseInt(opts.p2tr_output_count || this.defaultParams.p2tr_output_count)
    if (!Number.isInteger(p2tr_output_count) || p2tr_output_count < 0) {
      throw new Error('expecting positive p2tr output count')
    }

    this.params = {
      input_count,
      input_script,
      input_m,
      input_n,
      p2pkh_output_count,
      p2sh_output_count,
      p2sh_p2wpkh_output_count,
      p2sh_p2wsh_output_count,
      p2wpkh_output_count,
      p2wsh_output_count,
      p2tr_output_count
    }

    return this.params
  }

  getOutputCount() {
    return this.params.p2pkh_output_count + this.params.p2sh_output_count + this.params.p2sh_p2wpkh_output_count
      + this.params.p2sh_p2wsh_output_count + this.params.p2wpkh_output_count + this.params.p2wsh_output_count + this.params.p2tr_output_count
  }

  getSizeBasedOnInputType() {
    // In most cases the input size is predictable. For multisig inputs we need to perform a detailed calculation
    var inputSize = 0 // in virtual bytes
    var inputWitnessSize = 0
    var redeemScriptSize
    switch (this.params.input_script) {
      case 'P2PKH':
        inputSize = this.P2PKH_IN_SIZE
        break
      case 'P2SH-P2WPKH':
        inputSize = this.P2SH_P2WPKH_IN_SIZE
        inputWitnessSize = 107 // size(signature) + signature + size(pubkey) + pubkey
        break
      case 'P2WPKH':
        inputSize = this.P2WPKH_IN_SIZE
        inputWitnessSize = 107 // size(signature) + signature + size(pubkey) + pubkey
        break
      case 'P2TR': // Only consider the cooperative taproot signing path assume multisig is done via aggregate signatures
        inputSize = this.P2TR_IN_SIZE
        inputWitnessSize = 65 // getSizeOfVarInt(schnorrSignature) + schnorrSignature
        break
      case 'P2SH':
        redeemScriptSize = 1 + // OP_M
          this.params.input_n * (1 + this.PUBKEY_SIZE) + // OP_PUSH33 <pubkey>
          1 + // OP_N
          1 // OP_CHECKMULTISIG
        var scriptSigSize = 1 + // size(0)
        this.params.input_m * (1 + this.SIGNATURE_SIZE) + // size(SIGNATURE_SIZE) + signature
          this.getSizeOfScriptLengthElement(redeemScriptSize) + redeemScriptSize
        inputSize = 32 + 4 + this.getSizeOfVarInt(scriptSigSize) + scriptSigSize + 4
        break
      case 'P2SH-P2WSH':
      case 'P2WSH':
        redeemScriptSize = 1 + // OP_M
          this.params.input_n * (1 + this.PUBKEY_SIZE) + // OP_PUSH33 <pubkey>
          1 + // OP_N
          1 // OP_CHECKMULTISIG
        inputWitnessSize = 1 + // size(0)
          this.params.input_m * (1 + this.SIGNATURE_SIZE) + // size(SIGNATURE_SIZE) + signature
          this.getSizeOfScriptLengthElement(redeemScriptSize) + redeemScriptSize
        inputSize = 36 + // outpoint (spent UTXO ID)
          inputWitnessSize / 4 + // witness program
          4 // nSequence
        if (this.params.input_script === 'P2SH-P2WSH') {
          inputSize += 32 + 3 // P2SH wrapper (redeemscript hash) + overhead?
        }
    }

    return {
      inputSize,
      inputWitnessSize
    }
  }

  calcTxSize(opts) {
    this.prepareParams(opts)
    var output_count = this.getOutputCount()
    var { inputSize, inputWitnessSize } = this.getSizeBasedOnInputType()

    var txVBytes = this.getTxOverheadVBytes(this.params.input_script, this.params.input_count, output_count) +
      inputSize * this.params.input_count +
      this.P2PKH_OUT_SIZE * this.params.p2pkh_output_count +
      this.P2SH_OUT_SIZE * this.params.p2sh_output_count +
      this.P2SH_P2WPKH_OUT_SIZE * this.params.p2sh_p2wpkh_output_count +
      this.P2SH_P2WSH_OUT_SIZE * this.params.p2sh_p2wsh_output_count +
      this.P2WPKH_OUT_SIZE * this.params.p2wpkh_output_count +
      this.P2WSH_OUT_SIZE * this.params.p2wsh_output_count +
      this.P2TR_OUT_SIZE * this.params.p2tr_output_count

    var txBytes = this.getTxOverheadExtraRawBytes(this.params.input_script, this.params.input_count) + txVBytes + inputWitnessSize * this.params.input_count
    var txWeight = txVBytes * 4

    return { txVBytes, txBytes, txWeight }
  }

  estimateFee(vbyte, satVb) {
    if (isNaN(vbyte) || isNaN(satVb)) {
      throw new Error('Parameters should be numbers')
    }
    return parseInt(vbyte) * parseInt(satVb)
  }

  formatFeeRange(fee, multiplier) {
    if (isNaN(fee) || isNaN(multiplier)) {
      throw new Error('Parameters should be numbers')
    }

    fee = parseInt(fee)
    multiplier = Number(multiplier)

    if (multiplier < 0) {
      throw new Error('Multiplier cant be negative')
    }

    var multipliedFee = fee * multiplier

    return (fee - multipliedFee) + ' - ' + (fee + multipliedFee)
  }
}

module.exports = BtcSizeFeeEstimator
