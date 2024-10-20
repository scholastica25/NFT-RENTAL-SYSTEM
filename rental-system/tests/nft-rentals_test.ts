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

Clarinet.test({
    name: "Ensure that rent-nft works correctly",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const owner = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall(CONTRACT_NAME, 'create-rental', [types.uint(1), types.uint(100), types.uint(1000000)], owner.address),
            Tx.contractCall(CONTRACT_NAME, 'rent-nft', [types.uint(0)], user1.address),
        ]);

        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 2);
        block.receipts[0].result.expectOk().expectUint(0);
        block.receipts[1].result.expectOk().expectBool(true);

        // Check that the rental was created correctly
        const rental = chain.callReadOnlyFn(CONTRACT_NAME, 'get-rental', [types.uint(0)], owner.address);
        rental.result.expectSome().expectTuple({
            'owner': owner.address,
            'renter': types.some(user1.address),
            'token-id': types.uint(1),
            'rental-start': types.uint(2),
            'rental-end': types.uint(102),
            'price': types.uint(1000000),
        });
    },
});


Clarinet.test({
    name: "Ensure that end-rental works correctly",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const owner = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall(CONTRACT_NAME, 'create-rental', [types.uint(1), types.uint(10), types.uint(1000000)], owner.address),
            Tx.contractCall(CONTRACT_NAME, 'rent-nft', [types.uint(0)], user1.address),
        ]);

        // Fast-forward the chain
        chain.mineEmptyBlockUntil(20);

        block = chain.mineBlock([
            Tx.contractCall(CONTRACT_NAME, 'end-rental', [types.uint(0)], user1.address),
        ]);

        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectOk().expectBool(true);

        // Check that the rental was ended
        const rental = chain.callReadOnlyFn(CONTRACT_NAME, 'get-rental', [types.uint(0)], owner.address);
        rental.result.expectNone();
    },
});