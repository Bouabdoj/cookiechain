const Cookiechain = artifacts.require('./Cookiechain.sol')


contract('Cookiechain', (accounts) => { //or [deployer, author, tipper]
  let cookiechain

  before(async () => {
    cookiechain = await Cookiechain.deployed()
  })

  describe('deployment', async () => {
    let result;

    it('Check compartment', async () => {   
      result = await cookiechain.createCompartment('Personal');
      const compartmentsCount = await cookiechain.compartmentsCount();
      let compartment = await cookiechain.compartments(1);
      assert.equal(compartmentsCount, 1);
    })

    it('Check profile', async () => {
      await cookiechain.createProfile('Movies', 'Personal');
      await cookiechain.createProfile('Media', 'Personal');
      const profilesCount = await cookiechain.profilesCount();
      let profile1 = await cookiechain.profiles(1);
      let profile2 = await cookiechain.profiles(2);      
      assert.equal(profile1.compartment, 'Personal');
      assert.equal(profile2.compartment, 'Personal');
      assert.equal(profilesCount, 2);
    })      

    it('Check domain', async () => {
      await cookiechain.createDomain('Facebook.com', 'Media');
      await cookiechain.createDomain('netflix.com', 'Movies');
      const domainsCount = await cookiechain.domainsCount();
      let domain1 = await cookiechain.domains(1);
      let domain2 = await cookiechain.domains(2);      
      assert.equal(domain1.profile, 'Media');
      assert.equal(domain2.profile, 'Movies');
      assert.equal(domainsCount, 2);
    })

  })
})