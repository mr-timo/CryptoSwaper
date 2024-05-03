
<h1 align="center">🪙 CryptoSwaper 🪙</h1>        


<p align="center">
<img src="https://img.shields.io/badge/language-nodejs-green" />
<img src="https://img.shields.io/badge/platform-npm-red" />
<img src="https://img.shields.io/badge/platform-terminal-black" />
<img src="https://img.shields.io/badge/License-MIT-blue.svg" />
</p>

# About

2022 project 

NodeJS Bot to swap cryptos on multiple router (like PancakeSwap)

<h2> How to install 📦 </h2>
1 - Clone this repository

2 - Open a terminal at the root of the folder

3 - Run : `npm install`

<h2> How to setup :wrench: </h2>

- open to the `.env` file

This is how it work : 

`BNB_CONTRACT` => its just the contract address of the BNB on the BSC ( BNB is offenly use as money to spend for new tokens )

`TOKEN_OUT_CONTRACT` => This is the contract address of the money you want to SPEND for buying tokens

`AMOUNT_OF_TOKEN_OUT_TO_SPEND` => this is the amount of token you want to SPEND 

`ROUTER` => this is the contract address of the router you want to use to do your swap ( like a provider by default is pancakeswap )

`FACTORY` => this is the contract address of the factory you want to use

`YOUR_ADDRESS` => this is where you need to put the address of your DESTINATION wallet ( where the token freshly buyed will be send )

`YOUR_MNEMONIC` => the code has to access privatly to your wallet in order to spend money accross a swap platform , so here you need to put you private key

`SLIPPAGE` => this if the percentage of slippage you accept to loose in the transaction
`GWEI` => this is the Gas fees amount max you accept to pay
`GAS_LIMIT` => this is the gas limit
`MIN_LIQUIDITY_ADDED` => this if the min liquidity the token you want to buy should had for you to accept buying some

`TOKEN_IN_CONTRACT` => this is the contract address of the money you want to BUY

`WSS_NODE` => This is the SCAN provider 

<h2> How to use :moneybag: </h2>

1 - Run : `npm run swap`

It will show you a prompt with the title of the project and a menu with a choice

2 - Enter like :
 2.1 - `1` to buy a token with BNB
 2.2 - `2` to buy a token with another token
 2.3 - `0` to exit the program
 2.4 - any other choice will restart the prompt

 then press enter

It will simply automatically : 
- get the pair address to do the swap
- get the liquidity
- show you a visualisation of the transaction that will be done
- approve the token you need to spend
- do the transaction
- let you know if it succeed or fail

Thats it :)

Enjoy !
