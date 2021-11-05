
## Bitcoin Transaction Size / Fee Calculator

Based on [jlopp's project](https://github.com/jlopp/bitcoin-transaction-size-calculator).

What is this tool?
----------------
This tool makes it simple for anyone to determine the size and weight of a bitcoin transaction.


Who needs this tool?
----------------
Bitcoin wallet developers may find this tool helpful when writing transaction construction logic.

Bitcoin users may find this tool helpful if they are trying to construct a transaction manually and need to determine an appropriate transaction fee.

Usage
----------------

```
const BtcEstimator = require('btc-tx-size-fee-estimator')
const estimator = new BtcEstimator()

const opts = {
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
btcEstimator.calcTxSize(opts)

btcEstimator.estimateFee(vbyte, satVb)
btcEstimator.formatFeeRange(fee, multiplier) // format: lowerRangeLimit - upperRangeLimit

```

License
-------
The Bitcoin Transaction Size Calculator is released under the terms of the MIT license. See [COPYING](COPYING) for more

information or see http://opensource.org/licenses/MIT.