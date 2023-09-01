pragma solidity ^0.5.16;

contract Cookiechain {

  uint public cookiesCount = 0;
  mapping(uint => Cookie) public cookies;


  struct Cookie {
    string profile;
    string domain;
    string expirationDate;
    string name;
    string secure;
    string path;
    string value;
  }


  function createCookie(string memory _profile, string memory _domain, string memory _expirationDate, 
                  string memory _name, string memory _secure, string memory _path, string memory _value) public{
    cookiesCount++;
    cookies[cookiesCount] = Cookie(_profile, _domain, _expirationDate, _name, _secure, _path, _value);
  }

  function updateCookie(uint index, string memory _profile, string memory _domain, string memory _expirationDate, 
                  string memory _name, string memory _secure, string memory _path, string memory _value) public{
    cookies[index] = Cookie(_profile, _domain, _expirationDate, _name, _secure, _path, _value);
  }
 
  
}