import ethers from 'ethers';
import express from 'express';
import dotenv from 'dotenv';
import chalk from 'chalk';
import axios from 'axios';
import figlet from 'figlet';
import asciify from 'asciify-image';
import ps from 'prompt-sync';


const app = express();
dotenv.config();


const data = {
    BNB_CONTRACT: process.env.BNB_CONTRACT, //BNB contract

    TOKEN_OUT: process.env.TOKEN_OUT_CONTRACT, //Token out
  
    TOKEN_IN: process.env.TOKEN_IN_CONTRACT, // token that you will purchase = BUSD for test '0xe9e7cea3dedca5984780bafc599bd69add087d56'
  
    AMOUNT_OF_TOKEN_OUT_TO_SPEND : process.env.AMOUNT_OF_TOKEN_OUT_TO_SPEND, // how much you want to buy in the token you want
  
    factory: process.env.FACTORY,  //PancakeSwap V2 factory
  
    router: process.env.ROUTER, //PancakeSwap V2 router
  
    recipient: process.env.YOUR_ADDRESS, //your wallet address,
  
    Slippage : process.env.SLIPPAGE, //in Percentage
  
    gasPrice : ethers.utils.parseUnits(`${process.env.GWEI}`, 'gwei'), //in gwei
  
    gasLimit : process.env.GAS_LIMIT, //at least 21000
  
    minLiquidity : process.env.MIN_LIQUIDITY_ADDED //min liquidity added
  }

const wss = process.env.WSS_NODE;
const provider = new ethers.providers.WebSocketProvider(wss);

const mnemonic = process.env.YOUR_MNEMONIC //your memonic;
const wallet = new ethers.Wallet.fromMnemonic(mnemonic);
const account = wallet.connect(provider);

let tokenOut = data.TOKEN_OUT;
const tokenIn = data.TOKEN_IN;

let initialLiquidityDetected = false;
let jmlBnb = 0;

let asciiLogo = ""

let prompt = ps({sigint: true})

const factory = new ethers.Contract(
    data.factory,
    [
      'event PairCreated(address indexed token0, address indexed token1, address pair, uint)',
      'function getPair(address tokenA, address tokenB) external view returns (address pair)'
    ],
    account
);


const router = new ethers.Contract(
  data.router,
  [
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
    'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
    'function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external  payable returns (uint[] memory amounts)',
    'function swapExactETHForTokens( uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
    'function swapTokensForExactTokens(uint amountOut,uint amountInMax,address[] calldata path,address to,uint deadline) external returns (uint[] memory amounts)'
  ],
  account
);

let tokenInContract = {}
let tokenOutContract = {}

var asciiImageOptions = {
  color: false,
  fit:    'box',
  width:  20,
  height: 20
}

function getFigletData(stringToAsciify){
  return new Promise(resolve =>
    figlet(stringToAsciify, async function(err, data) {
      if (err) {
          console.log('Something went wrong...');
          console.dir(err);
          resolve(err)
      }
      resolve(data)
    })
  )
}

function getAsciifyImage(url) {
  return new Promise(resolve =>
    asciify(url, asciiImageOptions, function (err, asciified) {
      if (err) throw err;

      resolve(asciified);
    })
  )
}

const run = async () => {
 
  asciiLogo = await getAsciifyImage('./img/Mouse.jpg')

  let ascii = await getFigletData("$ CryptoSwaper $")

  console.log(ascii)

  console.log("Actual Slippage setup : " + data.Slippage)
  console.log("Actual Gas Price setup : " + process.env.GWEI)

  console.log("$--- Welcome into the best crypto swap bot ever made ! ---$")
  console.log("$---            Please select your options             ---$")
  console.log("$---             1 - Buy token with BNB                ---$")
  console.log("$---        2 - Buy token with another token           ---$")
  console.log("$---                  0 - Exit                         ---$")

let optionSelected = prompt("Please enter the number of the option you want => ")

const tokenOutAbis = await axios.get('https://api.bscscan.com/api?module=contract&action=getabi&address='+data.TOKEN_OUT);

tokenInContract = new ethers.Contract(
  data.TOKEN_IN,
  tokenOutAbis.data.result,
  account
);

tokenOutContract = new ethers.Contract(
  data.TOKEN_OUT,
  tokenOutAbis.data.result,
  account
);


if(optionSelected == 1) {
  data.TOKEN_OUT = data.BNB_CONTRACT
  tokenOut = data.TOKEN_OUT
  console.log("You select buy token with BNB !")
  await checkForLiquidityAndGetPairContract(optionSelected);
} else if(optionSelected == 2) {
  console.log("You select buy token with another token !")
  await checkForLiquidityAndGetPairContract(optionSelected);
} else if(optionSelected == 0){
  console.log("See you soon !")
  process.exit()
}
else {
  console.log("This option doesnt exist !")
  console.clear()
  run()
}

}

let checkForLiquidityAndGetPairContract = async(optionSelected) => {

    let pairContractAdress = await factory.getPair(tokenOut, tokenIn);


    console.log(chalk.blue(`pairAddress: ${pairContractAdress}`));
    if (pairContractAdress !== null && pairContractAdress !== undefined) {
      if (pairContractAdress.toString().indexOf('0x0000000000000') > -1) {
        console.log(chalk.red(`pairContractAddress ${pairContractAdress} not detected. Auto restart`));
        return await checkForLiquidityAndGetPairContract(optionSelected);
      }
    }
    const pairTokenValue = await tokenInContract.balanceOf(pairContractAdress);
    jmlBnb = await ethers.utils.formatUnits(pairTokenValue, 18);
    console.log(`value Token ( liquidity ) : ${pairTokenValue * 1e-18}`);

    if(parseFloat(jmlBnb) > parseFloat(data.minLiquidity)){
        setTimeout(() => buyAction(optionSelected), 3000);
    }
    else{
        initialLiquidityDetected = false;
        let liquidityOptionSelected = prompt("Do you want to continue even if there is no liqiduity ? Y/N => ")
        if(liquidityOptionSelected == "Y") {
          setTimeout(() => buyAction(optionSelected), 3000);
        } else {
          console.log(' run again...');
          return await checkForLiquidityAndGetPairContract(optionSelected);
        }
      }
  }

  let buyAction = async(optionSelected) => {
    if(initialLiquidityDetected === true) {
      console.log("Buy not done cause already buy");
      return null;
    }

    console.log("Ready to buy !")

    try {
      initialLiquidityDetected = true;

      let amountInMin = 0;

      const amountOut = ethers.utils.parseUnits(`${data.AMOUNT_OF_TOKEN_OUT_TO_SPEND}`, 18);

      if ( parseInt(data.Slippage) !== 0 ){
        const amountsIn = await router.getAmountsOut(amountOut, [tokenOut, tokenIn]);
        //Our execution price will be a bit different, we need some flexibility
        amountInMin = amountsIn[1].sub(amountsIn[1].div(`${data.Slippage}`))
       
        if(amountInMin > amountsIn[1]) {
          amountInMin = amountsIn[1]
        }
      
      }
      console.log(
        chalk.green.inverse(`Start to buy \n`)
         +
         `Buying Token
         =================
         tokenOut ( Token you spend ): ${(amountOut * 1e-18).toString() } ${tokenOut}
         From
         tokenIn ( Token you get ): ${(amountInMin * 1e-18).toString()} ${tokenIn}
         =================
       `);

       console.log('Processing Transaction.....');
       console.log(chalk.yellow(`amountOut: ${(amountOut  * 1e-18)} ${tokenOut}`));
       console.log(chalk.yellow(`amountInMin: ${amountInMin  * 1e-18}`));
       console.log(chalk.yellow(`tokenIn: ${tokenIn}`));
       console.log(chalk.yellow(`tokenOut: ${tokenOut}`));
       console.log(chalk.yellow(`data.recipient: ${data.recipient}`));
       console.log(chalk.yellow(`data.gasLimit: ${data.gasLimit}`));
       console.log(chalk.yellow(`data.gasPrice: ${data.gasPrice}`));


       console.log('Approving amount to spend.....');
       const approveOut = await tokenOutContract.approve(data.router, amountOut)
       console.log(chalk.green("Amount to spend approved !"));
       console.log("Approval receipt : " + approveOut.hash)

      
       if(optionSelected == 1) {
        console.log("Processing Swap BNB => Token..... ( The little mouse goes to the blockchain )'")
        const tx = await router.swapExactETHForTokens(
          amountInMin,
          [tokenOut, tokenIn],
          data.recipient,
          Date.now() + 1000 * 60 * 5, //5 minutes
          {
            'gasLimit': data.gasLimit,
            'gasPrice': data.gasPrice,
            'nonce' : null, //set you want buy at where position in blocks
            'value' : amountOut
        })
        console.log(asciiLogo)
        const finished = await tx.wait();
        console.log(chalk.green("Transaction (BNB => Token) succeed !! Welcome to the game !"));
        console.log(`Transaction receipt : https://www.bscscan.com/tx/${finished.logs[1].transactionHash}`);
        setTimeout(() => {process.exit()},2000);
       } else if(optionSelected == 2) {
        console.log('Processing Swap Token => Token..... ( The little goes to the blockchain )');
         const tx = await router.swapExactTokensForTokens(
          amountOut,
          amountInMin,
          [tokenOut, tokenIn],
          data.recipient,
          Math.floor((Date.now() + 1000 * 60 * 10) / 1000),
          {
           'gasLimit': data.gasLimit,
           'gasPrice': data.gasPrice,
           'nonce' : null, //set you want buy at where position in blocks,
         }
        )
        console.log(asciiLogo)
        const finished = await tx.wait();
        console.log(chalk.green("Transaction (Token => Token) succeed !! Welcome to the game !"));
        console.log(`Transaction receipt : https://www.bscscan.com/tx/${finished.logs[1].transactionHash}`);
        setTimeout(() => {process.exit()},2000);
       }
      
    
    }catch(err){ 
      console.log(err);
      console.log(chalk.red("ERREUR"))

      console.log("$--- We are sorry that you face an error ---$")
      console.log("$---      Do you want to try again ?     ---$")
      console.log("$---                Y/N                  ---$")

      let tryAgain = prompt("Y/N => ")

      if(tryAgain == "Y") {
        console.clear()
        run()
      } else {
        process.exit()
      }
    }
  }

  run();