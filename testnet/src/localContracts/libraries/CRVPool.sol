pragma solidity ^0.8.0;

interface CurveStethPool {
    function calc_withdraw_one_coin(uint256 token_amount, uint128 i)
        external
        view
        returns (uint256);
}
