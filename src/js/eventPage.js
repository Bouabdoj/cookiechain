var contextMenuItem = {
    "id": "AddDomain123",
    "title": "Add Domain",
    "contexts":["link"]
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create(contextMenuItem);
});

chrome.contextMenus.onClicked.addListener(function(clickData){
    if(clickData.menuItemId =="AddDomain123" )
    {
        var url = clickData.linkUrl;
        Add_domain(url);
    }
});

chrome.storage.onChanged.addListener(function(changes, storagename){
    var newval ;
    var notifOptions ={
        type: 'basic',
        iconUrl: '../../icon48.png',
        title: 'New domain to be added',
        message: 'Open the extension to add the selected domain'
    };

    if(changes.newdomain)
    {
        try {
            newval =  changes.newdomain.newValue.toString();
            chrome.notifications.create('Newdomainnotif', notifOptions);
        }
        catch (x) {
            newval="";
        }
        chrome.browserAction.setBadgeText({"text":newval});
    }
})


function Add_domain(url) {
    let domain = (new URL(url));
    domain = domain.hostname.replace('www.','');
    chrome.storage.sync.set({'newdomain': domain});
};


/*
it listens for messages coming from content.js and add the domain in 
the storage but in our case content.js won't send messages
*/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.todo == "addDomain")
    {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
            let url = tabs[0].url;
            Add_domain(url);
        });
    }
});


$(async function(){
    await App.load(); 

    chrome.webNavigation.onBeforeNavigate.addListener(async function(data){
        var profile = null;
        var cookiesCount = await App.cookiechain.methods.cookiesCount().call();

       if(data.url != "about:blank" && !data.url.includes("google") && !data.url.includes("new-tab-page"))
        {
            var URL_formatted = (new URL(data.url));
            let domain_triggered = (new URL(data.url));

            domain_triggered = domain_triggered.hostname.replace('www.','');

            chrome.storage.sync.get('domains', async function(domain){
                var domain_array=[];
                for(var elements in domain.domains) 
                {
                    domain_array.push({'domain':domain.domains[elements].domain, 'prof':domain.domains[elements].prof});
                    if(domain.domains[elements].domain == domain_triggered)
                        {
                            profile = domain.domains[elements].prof;
                        }
                }

                if(profile)
                {
                    chrome.storage.sync.get('profiles', async function(profiles){
                        for(var elements in profiles.profiles){
                            if(profiles.profiles[elements].prof == profile){
                                App.privateKey = profiles.profiles[elements].privateKey;
                                break;
                            }
                        }
                    });

                    for(var i = 1; i <= cookiesCount; i++){
                        var cookie = await App.cookiechain.methods.cookies(i).call();

                        if(profile == cookie.profile){

                            var domain = CryptoJS.AES.decrypt(cookie.domain.toString(), App.privateKey).toString(CryptoJS.enc.Utf8);
                            var expirationDate = parseInt(CryptoJS.AES.decrypt(cookie.expirationDate.toString(), App.privateKey).toString(CryptoJS.enc.Utf8));
                            var secure = Boolean(CryptoJS.AES.decrypt(cookie.secure.toString(), App.privateKey).toString(CryptoJS.enc.Utf8));
                            var name = CryptoJS.AES.decrypt(cookie.name.toString(), App.privateKey).toString(CryptoJS.enc.Utf8);
                            var path = CryptoJS.AES.decrypt(cookie.path.toString(), App.privateKey).toString(CryptoJS.enc.Utf8);
                            var value = CryptoJS.AES.decrypt(cookie.value.toString(), App.privateKey).toString(CryptoJS.enc.Utf8);

                            var domain_url = '';
                            domain_url += secure ? 'https://' : 'http://';
                            domain_url += domain.charAt(0) == '.' ? 'www' : '';
                            domain_url += domain;
                            domain_url += path;

                            try
                            {
                            
                            var updated_cookie = {'domain':domain ,'expirationDate':parseInt(expirationDate), 'url':domain_url, 'secure': Boolean(secure), 'name': name, 'path':path, 'value':value};    
                            chrome.cookies.set(updated_cookie);
                            console.log("Done Setting cookie");
                            }
                            catch(error)
                            {
                                console.log(error);
                            }
                            chrome.cookies.getAll({'url': data.url}, function(cookies_list){
                                for(var cookies in cookies_list)
                                {
                                    console.log(cookies_list[cookies].domain+" "+ cookies_list[cookies].path);
                                }
                            });

                        }

                    }
                }
                else
                {
                    Add_domain(data.url);
                }
            });
        }
    });


    chrome.webNavigation.onCompleted.addListener(async function(data){
        var cookiesCount = await App.cookiechain.methods.cookiesCount().call();
        var profile = null;
        if(data.url != "about:blank" && !data.url.includes("google") && !data.url.includes("new-tab-page"))
        {
            var URL_formatted = (new URL(data.url));
            let domain_triggered = (new URL(data.url));

            domain_triggered = domain_triggered.hostname.replace('www.','');
            chrome.storage.sync.get('domains', async function(domain){
                var domain_array=[];
                for(var elements in domain.domains) 
                {
                    domain_array.push({'domain':domain.domains[elements].domain, 'prof':domain.domains[elements].prof});
                    if(domain.domains[elements].domain == domain_triggered)
                        {
                            profile = domain.domains[elements].prof;
                        }

                }

                if(profile)
                {
                    var loaded_cookies=[];

                    chrome.storage.sync.get('profiles', async function(profiles){
                        for(var elements in profiles.profiles){
                            if(profiles.profiles[elements].prof == profile){
                                App.privateKey = profiles.profiles[elements].privateKey +'';
                                App.publicKey = await web3.eth.accounts.privateKeyToAccount(App.privateKey).address;
                                break;
                            }
                        }
                    });

                    chrome.cookies.getAll({'url':data.url}, async function(cookies_list){
                        for(var x in cookies_list)
                        {
                            var date = new Date();
                            var time = date.getTime() + 24 * 60 * 60 * 1000;
                            var domain = cookies_list[x].domain;
                            var expirationDate = cookies_list[x].expirationDate ? cookies_list[x].expirationDate + '' : time + '';
                            var name = cookies_list[x].name;
                            var path = cookies_list[x].path;
                            var secure = cookies_list[x].secure + '';
                            var value = cookies_list[x].value;
                            
                            try 
                            {

                                chrome.cookies.remove({'name':name,'url': data.url});

                                if(!secure)
                                {
                                    domain = domain.charAt(0) == '.' ? domain.substr(1, domain.length) : domain;
                                }
                                
                                loaded_cookies.push( {'domain':domain ,'expirationDate':expirationDate, 'secure': secure, 'name': name, 'path':path,'value':value});

                                console.log("Done");                  
                            } 
                            catch (error) {
                                console.log(error);    
                            }
                        }
                    });

                    for (var i = 1; i <= cookiesCount; i++){
                        var cookie = await App.cookiechain.methods.cookies(i).call();
                        if(cookie.profile == profile){
                            console.log(cookie.domain + " " + cookie.expirationDate);
         
                            var domain1 = CryptoJS.AES.decrypt(cookie.domain.toString(), App.privateKey).toString(CryptoJS.enc.Utf8);
                            var expirationDate1 = parseInt(CryptoJS.AES.decrypt(cookie.expirationDate.toString(), App.privateKey).toString(CryptoJS.enc.Utf8));
                            var secure1 = Boolean(CryptoJS.AES.decrypt(cookie.secure.toString(), App.privateKey).toString(CryptoJS.enc.Utf8));
                            var name1 = CryptoJS.AES.decrypt(cookie.name.toString(), App.privateKey).toString(CryptoJS.enc.Utf8);
                            var path1 = CryptoJS.AES.decrypt(cookie.path.toString(), App.privateKey).toString(CryptoJS.enc.Utf8);
                            var value1 = CryptoJS.AES.decrypt(cookie.value.toString(), App.privateKey).toString(CryptoJS.enc.Utf8);


                            try {
                                for(var j in loaded_cookies){

                                    if(name1.includes(loaded_cookies[j].name.charAt(0) == '.' ? loaded_cookies[j].name.substr(1, loaded_cookies[j].name.length) : loaded_cookies[j].name) && domain1.includes(loaded_cookies[j].domain.charAt(0) == '.' ? loaded_cookies[j].domain.substr(1, loaded_cookies[j].domain.length) : loaded_cookies[j].domain))
                                    {
                                        loaded_cookies[j].domain = CryptoJS.AES.encrypt(loaded_cookies[j].domain, App.privateKey).toString();
                                        loaded_cookies[j].expirationDate = CryptoJS.AES.encrypt(loaded_cookies[j].expirationDate, App.privateKey).toString();
                                        loaded_cookies[j].value = CryptoJS.AES.encrypt(loaded_cookies[j].value, App.privateKey).toString();
                                        loaded_cookies[j].secure = CryptoJS.AES.encrypt(loaded_cookies[j].secure, App.privateKey).toString();
                                        loaded_cookies[j].path = CryptoJS.AES.encrypt(loaded_cookies[j].path, App.privateKey).toString();
                                        loaded_cookies[j].name = CryptoJS.AES.encrypt(loaded_cookies[j].name, App.privateKey).toString();

                                        await App.cookiechain.methods.updateCookie(i, profile, loaded_cookies[j].domain, loaded_cookies[j].expirationDate, loaded_cookies[j].name, loaded_cookies[j].secure + '', loaded_cookies[j].path, loaded_cookies[j].value).send({from: App.publicKey, gas:3000000});
                                        loaded_cookies.splice(j, 1);
                                        
                                        break;
                                    }    
                                }

                                console.log("Done");

                            } catch(error) {
                                console.log(error);
                            }
                        }                
                    }


                    chrome.cookies.getAll({'url': data.url}, async function(cookies_list){
                        for(var cookie in cookies_list)
                        {
                            console.log(cookies_list[cookie].domain+" "+ cookies_list[cookie].storeId+" "+ cookies_list[cookie].path);
                        }

                        for(var j in loaded_cookies){
                            var domain = loaded_cookies[j].domain;
                            var expirationDate = loaded_cookies[j].expirationDate;
                            var name = loaded_cookies[j].name;
                            var secure = loaded_cookies[j].secure;
                            var path = loaded_cookies[j].path;
                            var value = loaded_cookies[j].value;

                            domain = CryptoJS.AES.encrypt(domain, App.privateKey).toString();
                            secure = CryptoJS.AES.encrypt(secure, App.privateKey).toString();
                            path = CryptoJS.AES.encrypt(path, App.privateKey).toString();
                            name = CryptoJS.AES.encrypt(name, App.privateKey).toString();
                            expirationDate = CryptoJS.AES.encrypt(expirationDate, App.privateKey).toString();
                            value = CryptoJS.AES.encrypt(value, App.privateKey).toString();

                          
                            await App.cookiechain.methods.createCookie(profile, domain, expirationDate, name, secure, path, value).send({from: App.publicKey, gas:3000000});
                        }

                    });                

                }
                else
                {
                    //Add_domain(data.url);
                    //Block traffic or fire notification
                }
            });
        }
    });
});

