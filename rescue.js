const { Web3 } = require('web3');
require('dotenv').config();

class SimpleRescueDebug {
    constructor() {
        this.web3 = new Web3('https://bsc-dataseed.binance.org/');
        
        this.config = {
            SAFE_WALLET: process.env.SAFE_WALLET || '', // Safe wallet
            SAFE_PRIVATE_KEY: process.env.SAFE_PRIVATE_KEY || '', // Safe wallet private key
            
            COMPROMISED_WALLET: process.env.COMPROMISED_WALLET || '', // Compromised wallet
            COMPROMISED_PRIVATE_KEY: process.env.COMPROMISED_PRIVATE_KEY || '', // Compromised wallet private key
            
            TOKEN_ADDRESS: process.env.TOKEN_ADDRESS || '', // Token address
        };
        
        // Private key formatla
        this.config.SAFE_PRIVATE_KEY = this.formatPrivateKey(this.config.SAFE_PRIVATE_KEY);
        this.config.COMPROMISED_PRIVATE_KEY = this.formatPrivateKey(this.config.COMPROMISED_PRIVATE_KEY);
        
        // Accounts ekle
        this.safeAccount = this.web3.eth.accounts.privateKeyToAccount(this.config.SAFE_PRIVATE_KEY);
        this.compromisedAccount = this.web3.eth.accounts.privateKeyToAccount(this.config.COMPROMISED_PRIVATE_KEY);
        
        this.web3.eth.accounts.wallet.add(this.safeAccount);
        this.web3.eth.accounts.wallet.add(this.compromisedAccount);
        
        console.log('✅ Debug sürümü hazır');
    }
    
    formatPrivateKey(privateKey) {
        if (!privateKey || privateKey === '**' || privateKey === '') {
            return null;
        }
        
        privateKey = privateKey.trim();
        
        if (!privateKey.startsWith('0x')) {
            privateKey = '0x' + privateKey;
        }
        
        return privateKey;
    }
    
    async debugBalances() {
        console.log('🔍 BALANCE DEBUG:');
        console.log('=================');
        
        try {
            // Token balance
            const tokenBalance = await this.checkTokenBalance();
            console.log(`Token balance (raw): ${tokenBalance}`);
            console.log(`Token balance type: ${typeof tokenBalance}`);
            
            // BNB balances
            const safeBnb = await this.web3.eth.getBalance(this.config.SAFE_WALLET);
            const compromisedBnb = await this.web3.eth.getBalance(this.config.COMPROMISED_WALLET);
            
            console.log(`Safe BNB (raw): ${safeBnb}`);
            console.log(`Safe BNB type: ${typeof safeBnb}`);
            console.log(`Compromised BNB (raw): ${compromisedBnb}`);
            console.log(`Compromised BNB type: ${typeof compromisedBnb}`);
            
            // Gas price
            const gasPrice = await this.web3.eth.getGasPrice();
            console.log(`Gas price (raw): ${gasPrice}`);
            console.log(`Gas price type: ${typeof gasPrice}`);
            
            // Gas calculation debug - TÜM DEĞERLERİ BİGİNT OLARAK ÇEVIR
            console.log('\n🧮 GAS CALCULATION DEBUG:');
            const gasPriceBigInt = BigInt(gasPrice.toString());
            const gasNeededBigInt = BigInt('100000');
            
            console.log(`Gas price (BigInt): ${gasPriceBigInt}`);
            console.log(`Gas needed (BigInt): ${gasNeededBigInt}`);
            
            // BigInt calculation
            const gasFee = gasPriceBigInt * gasNeededBigInt;
            const gasFeeStr = gasFee.toString();
            
            console.log(`Gas fee (BigInt): ${gasFee}`);
            console.log(`Gas fee (string): ${gasFeeStr}`);
            console.log(`Gas fee in BNB: ${this.web3.utils.fromWei(gasFeeStr, 'ether')}`);
            
            // Balance comparison - TÜM KARŞILAŞTIRMALARI BİGİNT İLE YAP
            const safeBnbBigInt = BigInt(safeBnb.toString());
            const compromisedBnbBigInt = BigInt(compromisedBnb.toString());
            
            console.log('\n💰 BALANCE COMPARISON:');
            console.log(`Safe wallet has: ${this.web3.utils.fromWei(safeBnb.toString(), 'ether')} BNB`);
            console.log(`Compromised wallet has: ${this.web3.utils.fromWei(compromisedBnb.toString(), 'ether')} BNB`);
            console.log(`Gas fee needed: ${this.web3.utils.fromWei(gasFeeStr, 'ether')} BNB`);
            console.log(`Safe wallet sufficient funds: ${safeBnbBigInt >= gasFee}`);
            console.log(`Compromised wallet sufficient funds: ${compromisedBnbBigInt >= gasFee}`);
            
            return {
                tokenBalance: tokenBalance.toString(),
                safeBnb: safeBnb.toString(),
                compromisedBnb: compromisedBnb.toString(),
                gasPrice: gasPrice.toString(),
                gasFee: gasFeeStr,
                safeHasFunds: safeBnbBigInt >= gasFee,
                compromisedHasFunds: compromisedBnbBigInt >= gasFee
            };
            
        } catch (error) {
            console.error('❌ Debug error:', error.message);
            console.error('Stack:', error.stack);
            return null;
        }
    }
    
    async checkTokenBalance() {
        const tokenABI = [
            {
                "constant": true,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            }
        ];
        
        const tokenContract = new this.web3.eth.Contract(tokenABI, this.config.TOKEN_ADDRESS);
        const balance = await tokenContract.methods.balanceOf(this.config.COMPROMISED_WALLET).call();
        
        return balance;
    }
    
    async bundleRescue() {
        console.log('\n🚀 BUNDLE RESCUE BAŞLATIYOR:');
        console.log('=============================');
        
        const debugInfo = await this.debugBalances();
        
        if (!debugInfo) {
            console.log('❌ Debug bilgileri alınamadı, rescue iptal edildi');
            return;
        }
        
        // BigInt karşılaştırmaları düzelt
        const tokenBalanceBigInt = BigInt(debugInfo.tokenBalance);
        const gasFeeNeededBigInt = BigInt(debugInfo.gasFee);
        const safeBnbBigInt = BigInt(debugInfo.safeBnb);
        const compromisedBnbBigInt = BigInt(debugInfo.compromisedBnb);
        
        if (!debugInfo.safeHasFunds) {
            console.log('❌ Güvenli cüzdanda yeterli BNB yok, rescue iptal edildi');
            console.log(`Gerekli: ${this.web3.utils.fromWei(debugInfo.gasFee, 'ether')} BNB`);
            console.log(`Mevcut: ${this.web3.utils.fromWei(debugInfo.safeBnb, 'ether')} BNB`);
            return;
        }
        
        if (tokenBalanceBigInt === BigInt('0')) {
            console.log('❌ Token bulunamadı, rescue iptal edildi');
            return;
        }
        
        console.log('\n✅ Koşullar uygun, bundle rescue devam ediyor...');
        
        try {
            // Bundle transaction hazırla
            const bundleTransactions = [];
            
            // İlk önce compromised wallet'a gas gönder (sadece gerekirse)
            if (!debugInfo.compromisedHasFunds) {
                console.log('📤 Step 1: Gas fee gönderiliyor...');
                
                const gasTransferTx = {
                    from: this.config.SAFE_WALLET,
                    to: this.config.COMPROMISED_WALLET,
                    value: debugInfo.gasFee,
                    gasPrice: debugInfo.gasPrice,
                    gas: '21000'
                };
                
                bundleTransactions.push(gasTransferTx);
            }
            
            // Token transfer transaction hazırla
            console.log('📤 Step 2: Token transfer hazırlanıyor...');
            const tokenTransferData = await this.getTokenTransferData(debugInfo.tokenBalance);
            
            const tokenTx = {
                from: this.config.COMPROMISED_WALLET,
                to: this.config.TOKEN_ADDRESS,
                data: tokenTransferData,
                gasPrice: debugInfo.gasPrice,
                gas: '100000'
            };
            
            bundleTransactions.push(tokenTx);
            
            // Bundle'ı çalıştır
            console.log('🔗 Bundle transactions çalıştırılıyor...');
            
            for (let i = 0; i < bundleTransactions.length; i++) {
                const tx = bundleTransactions[i];
                console.log(`📦 Transaction ${i + 1}/${bundleTransactions.length} gönderiliyor...`);
                
                const result = await this.web3.eth.sendTransaction(tx);
                console.log(`✅ Transaction ${i + 1} başarılı:`, result.transactionHash);
                
                // Transactions arasında kısa bekleme
                if (i < bundleTransactions.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
            
            console.log('\n🎉 BUNDLE RESCUE TAMAMLANDI!');
            
            // Final balances kontrol et
            await new Promise(resolve => setTimeout(resolve, 5000));
            console.log('\n📊 FINAL BALANCE CHECK:');
            await this.debugBalances();
            
        } catch (error) {
            console.error('❌ Bundle rescue hatası:', error.message);
            console.error('Stack:', error.stack);
        }
    }
    
    async simpleRescue() {
        console.log('\n🚀 SIMPLE RESCUE BAŞLATIYOR:');
        console.log('=============================');
        
        const debugInfo = await this.debugBalances();
        
        if (!debugInfo) {
            console.log('❌ Debug bilgileri alınamadı, rescue iptal edildi');
            return;
        }
        
        if (!debugInfo.safeHasFunds) {
            console.log('❌ Yeterli BNB yok, rescue iptal edildi');
            return;
        }
        
        const tokenBalanceBigInt = BigInt(debugInfo.tokenBalance);
        if (tokenBalanceBigInt === BigInt('0')) {
            console.log('❌ Token bulunamadı, rescue iptal edildi');
            return;
        }
        
        console.log('\n✅ Koşullar uygun, rescue devam ediyor...');
        
        try {
            // Step 1: BNB gönder (sadece gerekirse)
            if (!debugInfo.compromisedHasFunds) {
                console.log('📤 Step 1: BNB gönderiliyor...');
                const bnbTx = {
                    from: this.config.SAFE_WALLET,
                    to: this.config.COMPROMISED_WALLET,
                    value: debugInfo.gasFee,
                    gasPrice: debugInfo.gasPrice,
                    gas: '21000'
                };
                
                const bnbResult = await this.web3.eth.sendTransaction(bnbTx);
                console.log('✅ BNB gönderildi:', bnbResult.transactionHash);
                
                // Biraz bekle
                await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
                console.log('✅ Compromised wallet\'ta zaten yeterli gas var');
            }
            
            // Step 2: Token transfer
            console.log('📤 Step 2: Token transfer ediliyor...');
            const tokenTransferData = await this.getTokenTransferData(debugInfo.tokenBalance);
            
            const tokenTx = {
                from: this.config.COMPROMISED_WALLET,
                to: this.config.TOKEN_ADDRESS,
                data: tokenTransferData,
                gasPrice: debugInfo.gasPrice,
                gas: '100000'
            };
            
            const tokenResult = await this.web3.eth.sendTransaction(tokenTx);
            console.log('✅ Token transfer edildi:', tokenResult.transactionHash);
            
            console.log('\n🎉 RESCUE TAMAMLANDI!');
            
        } catch (error) {
            console.error('❌ Rescue hatası:', error.message);
            console.error('Stack:', error.stack);
        }
    }
    
    async getTokenTransferData(balance) {
        const tokenABI = [
            {
                "constant": false,
                "inputs": [
                    {"name": "_to", "type": "address"},
                    {"name": "_value", "type": "uint256"}
                ],
                "name": "transfer",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            }
        ];
        
        const tokenContract = new this.web3.eth.Contract(tokenABI, this.config.TOKEN_ADDRESS);
        
        return tokenContract.methods.transfer(
            this.config.SAFE_WALLET,
            balance.toString() // Balance'ı string'e çevir
        ).encodeABI();
    }
}

async function main() {
    try {
        const rescue = new SimpleRescueDebug();
        await rescue.debugBalances();
        
        console.log('\n🚀 Bundle rescue başlatılıyor...');
        await rescue.bundleRescue();
        
        // Alternatif olarak simple rescue:
        // await rescue.simpleRescue();
        
    } catch (error) {
        console.error('❌ Main error:', error);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = SimpleRescueDebug;