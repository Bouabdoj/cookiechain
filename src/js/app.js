
App = {
  account: '0x0',
  cookiechain: {},
  web3: {},
  privateKey: '',
  publicKey: '',

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {

    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        // set the provider you want from Web3.providers
        web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    }
  },

  loadAccount: async () => {
    App.web3 = web3;
    App.account = await web3.eth.getAccounts();
  },

  loadContract: async () => {
    const networkId = await web3.eth.net.getId()
    var networkData;
    var abi;

    await $.getJSON("../../build/contracts/Cookiechain.json", function (data) {
      networkData =  data.networks[networkId];
      abi = data.abi;
    })
    if (networkData){
      const cookiechain = new web3.eth.Contract(abi, networkData.address)
      App.cookiechain = cookiechain
    }else{
      window.alert('Cookiechain contract not deployed to detected network.')
    }    
  },

}


