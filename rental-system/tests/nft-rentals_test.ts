import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

const CONTRACT_NAME = 'nft-rental-system';

Clarinet.test({
    name: "Ensure that create-rental can only be called by the contract owner",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const owner = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall(CONTRACT_NAME, 'create-rental', [types.uint(1), types.uint(100), types.uint(1000000)], owner.address),
            Tx.contractCall(CONTRACT_NAME, 'create-rental', [types.uint(2), types.uint(100), types.uint(1000000)], user1.address),
        ]);

        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 2);
        block.receipts[0].result.expectOk().expectUint(0);
        block.receipts[1].result.expectErr().expectUint(100); // err-owner-only
    },
});