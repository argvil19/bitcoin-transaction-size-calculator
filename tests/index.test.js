/* eslint no-undef: 0 */
const BtcSizeFeeEstimator = require('../dist')

describe('BtcSizeFeeEstimator', () => {
  var opts = {}
  var btcEstimator = null

  beforeEach(() => {
    opts = {
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
    btcEstimator = new BtcSizeFeeEstimator()
  })

  it('should initialize', () => {
    expect(btcEstimator).toBeInstanceOf(BtcSizeFeeEstimator)
  })

  describe('getSizeOfScriptLengthElement', () => {
    it('should return 1 if length < 75', () => {
      for (let i = 0; i < 75; i++) {
        expect(btcEstimator.getSizeOfScriptLengthElement(i)).toBe(1)
      }
    })

    it('should return 2 if length <= 255', () => {
      for (let i = 75; i <= 255; i++) {
        expect(btcEstimator.getSizeOfScriptLengthElement(i)).toBe(2)
      }
    })

    it('should return 3 if length <= 65535', () => {
      for (let i = 256; i <= 65535; i++) {
        expect(btcEstimator.getSizeOfScriptLengthElement(i)).toBe(3)
      }
    })

    it('should return 5 if length <= 4294967295', () => {
      expect(btcEstimator.getSizeOfScriptLengthElement(4294967295)).toBe(5)
      expect(btcEstimator.getSizeOfScriptLengthElement(65536)).toBe(5)
    })

    it('should throw if length >= 4294967296', () => {
      expect(() => btcEstimator.getSizeOfScriptLengthElement(4294967296)).toThrow()
    })
  })

  describe('getSizeOfVarInt', () => {
    it('should return 1 if length < 75', () => {
      for (let i = 0; i < 253; i++) {
        expect(btcEstimator.getSizeOfVarInt(i)).toBe(1)
      }
    })

    it('should return 3 if length < 65535', () => {
      for (let i = 253; i < 65535; i++) {
        expect(btcEstimator.getSizeOfVarInt(i)).toBe(3)
      }
    })

    it('should return 5 if length < 4294967295', () => {
      expect(btcEstimator.getSizeOfVarInt(65535)).toBe(5)
      expect(btcEstimator.getSizeOfVarInt(4294967294)).toBe(5)
    })

    it('should return 9 if length <= Number.MAX_SAFE_INTEGER', () => {
      expect(btcEstimator.getSizeOfVarInt(4294967295)).toBe(9)
      expect(btcEstimator.getSizeOfVarInt(Number.MAX_SAFE_INTEGER)).toBe(9)
    })

    it('should throw if length >= 18446744073709551615', () => {
      expect(() => btcEstimator.getSizeOfVarInt(18446744073709551615)).toThrow()
    })
  })

  describe('getTxOverheadVBytes', () => {
    it('should return 10 given input type P2PKH/P2SH, input/output count 0', () => {
      expect(btcEstimator.getTxOverheadVBytes('P2PKH', 0, 0)).toBe(10)
      expect(btcEstimator.getTxOverheadVBytes('P2SH', 0, 0)).toBe(10)
    })

    it('should return 10 given input type P2PKH/P2SH, input/output count 0', () => {
      expect(btcEstimator.getTxOverheadVBytes('P2PKH', 0, 0)).toBe(10)
      expect(btcEstimator.getTxOverheadVBytes('P2SH', 0, 0)).toBe(10)
    })

    it('should return 10.75 given any other input type, input/output count 0', () => {
      expect(btcEstimator.getTxOverheadVBytes('P2WPKH', 0, 0)).toBe(10.75)
      expect(btcEstimator.getTxOverheadVBytes('P2WSH', 0, 0)).toBe(10.75)
      expect(btcEstimator.getTxOverheadVBytes('P2SH-P2WPKH', 0, 0)).toBe(10.75)
      expect(btcEstimator.getTxOverheadVBytes('P2SH-P2WSH', 0, 0)).toBe(10.75)
      expect(btcEstimator.getTxOverheadVBytes('P2TR', 0, 0)).toBe(10.75)
    })

    it('should take into account input/output count', () => {
      expect(btcEstimator.getTxOverheadVBytes('P2PKH', 65534, 65534)).toBe(14)
      expect(btcEstimator.getTxOverheadVBytes('P2SH', 4294967294, 4294967294)).toBe(18)
      expect(btcEstimator.getTxOverheadVBytes('P2SH', Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)).toBe(26)
    })
  })

  describe('getTxOverheadExtraRawBytes', () => {
    it('should return 0 if type P2PKH/P2SH', () => {
      expect(btcEstimator.getTxOverheadExtraRawBytes('P2PKH', 9999)).toBe(0)
      expect(btcEstimator.getTxOverheadExtraRawBytes('P2PKH', 0)).toBe(0)
      expect(btcEstimator.getTxOverheadExtraRawBytes('P2SH', 9999)).toBe(0)
      expect(btcEstimator.getTxOverheadExtraRawBytes('P2SH', 0)).toBe(0)
    })

    it('should calculate correctly for other input types', () => {
      expect(btcEstimator.getTxOverheadExtraRawBytes('P2SH-P2WPKH', 9999)).toBe(3.75)
      expect(btcEstimator.getTxOverheadExtraRawBytes('P2TR', 0)).toBe(2.25)
    })
  })

  describe('prepareParams', () => {
    it('should use default params if not set', () => {
      btcEstimator.prepareParams()
      expect(btcEstimator.params).toEqual(
        expect.objectContaining(btcEstimator.defaultParams)
      )

      btcEstimator.prepareParams({ input_script: 'P2SH' })
      expect(btcEstimator.params.input_script).toEqual('P2SH')
      expect(btcEstimator.params.p2sh_output_count).toEqual(0)
    })

    it('should set params correctly', () => {
      opts = {
        input_count: 1,
        input_script: 'P2SH',
        input_m: 2,
        input_n: 3,
        p2pkh_output_count: 4,
        p2sh_output_count: 5,
        p2sh_p2wpkh_output_count: 6,
        p2sh_p2wsh_output_count: 7,
        p2wpkh_output_count: 8,
        p2wsh_output_count: 9,
        p2tr_output_count: 10
      }
      btcEstimator.prepareParams(opts)
      expect(btcEstimator.params.input_count).toBe(1)
      expect(btcEstimator.params.input_script).toBe('P2SH')
      expect(btcEstimator.params.input_m).toBe(2)
      expect(btcEstimator.params.input_n).toBe(3)
      expect(btcEstimator.params.p2pkh_output_count).toBe(4)
      expect(btcEstimator.params.p2sh_output_count).toBe(5)
      expect(btcEstimator.params.p2sh_p2wpkh_output_count).toBe(6)
      expect(btcEstimator.params.p2sh_p2wsh_output_count).toBe(7)
      expect(btcEstimator.params.p2wpkh_output_count).toBe(8)
      expect(btcEstimator.params.p2wsh_output_count).toBe(9)
      expect(btcEstimator.params.p2tr_output_count).toBe(10)
    })

    it('should throw errors if params are not correctly set', () => {
      opts.input_count = 'a'
      expect(() => btcEstimator.prepareParams(opts)).toThrow()

      opts.input_script = 'ERROR'
      expect(() => btcEstimator.prepareParams(opts)).toThrow()

      opts.input_m = 'a'
      expect(() => btcEstimator.prepareParams(opts)).toThrow()

      opts.input_n = 'a'
      expect(() => btcEstimator.prepareParams(opts)).toThrow()

      opts.p2pkh_output_count = 'a'
      expect(() => btcEstimator.prepareParams(opts)).toThrow()

      opts.p2sh_output_count = 'a'
      expect(() => btcEstimator.prepareParams(opts)).toThrow()

      opts.p2sh_p2wpkh_output_count = 'a'
      expect(() => btcEstimator.prepareParams(opts)).toThrow()

      opts.p2sh_p2wsh_output_count = 'a'
      expect(() => btcEstimator.prepareParams(opts)).toThrow()

      opts.p2wsh_output_count = 'a'
      expect(() => btcEstimator.prepareParams(opts)).toThrow()

      opts.p2tr_output_count = 'a'
      expect(() => btcEstimator.prepareParams(opts)).toThrow()
    })
  })

  describe('getOutputCount', () => {
    it('should sum all output count params', () => {
      opts = {
        input_count: 1,
        input_script: 'P2PKH',
        input_m: 1,
        input_n: 1,
        p2pkh_output_count: 1,
        p2sh_output_count: 1,
        p2sh_p2wpkh_output_count: 1,
        p2sh_p2wsh_output_count: 1,
        p2wpkh_output_count: 1,
        p2wsh_output_count: 1,
        p2tr_output_count: 1
      }
      btcEstimator.prepareParams(opts)
      expect(btcEstimator.getOutputCount()).toBe(7)
    })
  })

  describe('getSizeBasedOnInputType', () => {
    it('should return inputSize = P2PKH_IN_SIZE | inputWitnessSize = 0 if input type is P2PKH', () => {
      btcEstimator.prepareParams()
      expect(btcEstimator.getSizeBasedOnInputType()).toEqual(
        expect.objectContaining({
          inputSize: btcEstimator.P2PKH_IN_SIZE,
          inputWitnessSize: 0
        })
      )
    })

    it('should return inputSize = P2SH_P2WPKH_IN_SIZE | inputWitnessSize = 107 if input type is P2SH-P2WPKH', () => {
      btcEstimator.prepareParams({ input_script: 'P2SH-P2WPKH' })
      expect(btcEstimator.getSizeBasedOnInputType()).toEqual(
        expect.objectContaining({
          inputSize: btcEstimator.P2SH_P2WPKH_IN_SIZE,
          inputWitnessSize: 107
        })
      )
    })

    it('should return inputSize = P2WPKH_IN_SIZE | inputWitnessSize = 107 if input type is P2WPKH', () => {
      btcEstimator.prepareParams({ input_script: 'P2WPKH' })
      expect(btcEstimator.getSizeBasedOnInputType()).toEqual(
        expect.objectContaining({
          inputSize: btcEstimator.P2WPKH_IN_SIZE,
          inputWitnessSize: 107
        })
      )
    })

    it('should return inputSize = P2TR_IN_SIZE | inputWitnessSize = 65 if input type is P2TR', () => {
      btcEstimator.prepareParams({ input_script: 'P2TR' })
      expect(btcEstimator.getSizeBasedOnInputType()).toEqual(
        expect.objectContaining({
          inputSize: btcEstimator.P2TR_IN_SIZE,
          inputWitnessSize: 65
        })
      )
    })

    it('should return inputSize = 46 | inputWitnessSize = 0 if input type is P2SH, default params', () => {
      btcEstimator.prepareParams({ input_script: 'P2SH' })
      expect(btcEstimator.getSizeBasedOnInputType()).toEqual(
        expect.objectContaining({
          inputSize: 46,
          inputWitnessSize: 0
        })
      )
    })

    it('should return inputSize = 41.25 | inputWitnessSize = 5 if input type is P2WSH, default params', () => {
      btcEstimator.prepareParams({ input_script: 'P2WSH' })
      expect(btcEstimator.getSizeBasedOnInputType()).toEqual(
        expect.objectContaining({
          inputSize: 41.25,
          inputWitnessSize: 5
        })
      )
    })

    it('should return inputSize = 41.25 | inputWitnessSize = 5 if input type is P2SH-P2WSH, default params', () => {
      btcEstimator.prepareParams({ input_script: 'P2SH-P2WSH' })
      expect(btcEstimator.getSizeBasedOnInputType()).toEqual(
        expect.objectContaining({
          inputSize: 76.25,
          inputWitnessSize: 5
        })
      )
    })
  })

  describe('calcTxSize', () => {
    it('it should calculate weight given no params (use default)', () => {
      expect(btcEstimator.calcTxSize()).toEqual(
        expect.objectContaining({
          txBytes: 10,
          txVBytes: 10,
          txWeight: 40
        })
      )
    })

    it('should calculate weight based on params', () => {
      // random params
      opts.p2pkh_output_count = 10
      opts.p2tr_output_count = 2
      expect(btcEstimator.calcTxSize(opts)).toEqual(
        expect.objectContaining({
          txBytes: 436,
          txVBytes: 436,
          txWeight: 1744
        })
      )
    })
  })

  describe('estimatedFee', () => {
    it('should multiply params in order to calculate final fee', () => {
      expect(btcEstimator.estimateFee(100, 5)).toEqual(500)
    })

    it('should throw an error is NaN is passed', () => {
      expect(() => btcEstimator.estimateFee('a', 10)).toThrow()
      expect(() => btcEstimator.estimateFee(100, 'b')).toThrow()
    })
  })

  describe('formatFeeRange', () => {
    it('should format fee', () => {
      expect(btcEstimator.formatFeeRange(1000, 0.05)).toEqual('950 - 1050')
    })
  })
})
