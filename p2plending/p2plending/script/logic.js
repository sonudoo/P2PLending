/**
 * @param {org.p2plending.model.requestTxn} tx The sample transaction instance.
 * @transaction
 */
async function requestTxn(tx) {
    let requestRegistry = await getAssetRegistry('org.p2plending.model.Request');
    let factory = getFactory();
    let asset = factory.newResource('org.p2plending.model', 'Request', tx.transactionId);
    asset.amount = tx.amount;
    asset.interest = tx.interest;
    asset.isPending = 1;
    asset.receiver = factory.newRelationship('org.p2plending.model','Person',tx.receiverId);
    await requestRegistry.add(asset);
  }
  
  /**
   * @param {org.p2plending.model.lendTxn} tx The sample transaction instance.
   * @transaction
   */
  
  async function lendTxn(tx){
    let requestHistoryRegistry = await getAssetRegistry('org.p2plending.model.Request');
    let requestHistory = await requestHistoryRegistry.getAll();
    let present = false;
    let receiverId = "";
    let amount = 0;
    let idx = -1;
    for(let i in requestHistory){
      if(requestHistory[i].requestId == tx.requestId){
        if(requestHistory[i].isPending==0)
          throw "Error: Request has already been fulfilled";
        present = true;
        receiverId = requestHistory[i].receiver.toString().split("#")[1].split("}")[0];
        amount = requestHistory[i].amount;
          idx = i;
        if(tx.sender == receiverId)
          throw "Error: You are not allowed to send money to yourself";
        break;
      }
    }
    if(present==false){
      throw "Error: Request Id not found";
   }
   let request = requestHistory[idx];
    request.isPending = 0;
    
    await requestHistoryRegistry.update(request);
    
    let participantRegistry = await getParticipantRegistry('org.p2plending.model.Person');
    let sender = await participantRegistry.get(tx.senderId);
    if(sender.balance < amount){
      throw "Not enough balance to send";
    }
    sender.balance -= amount;
    await participantRegistry.update(sender);
    let receiver = await participantRegistry.get(receiverId);
    receiver.balance += amount;
    await participantRegistry.update(receiver);
    
    let lendRegistry = await getAssetRegistry('org.p2plending.model.Lend');
    let factory = getFactory();
    let asset = factory.newResource('org.p2plending.model', 'Lend', tx.transactionId);
    asset.isPending = 1;
    asset.sender = factory.newRelationship('org.p2plending.model','Person',tx.senderId);
    asset.request = factory.newRelationship('org.p2plending.model','Request',requestHistory[idx].requestId);
    await lendRegistry.add(asset);
  }
  
  /**
   * @param {org.p2plending.model.repaymentTxn} tx The sample transaction instance.
   * @transaction
   */
  
  async function repaymentTxn(tx){
    let lendHistoryRegistry = await getAssetRegistry('org.p2plending.model.Lend');
    let lendHistory = await lendHistoryRegistry.getAll();
    let present = false;
    let idx = -1;
    for(let i in lendHistory){
      if(lendHistory[i].lendId == tx.lendId){
        if(lendHistory[i].isPending==0)
          throw "Error: Payment has already been done";
        present = true;
        idx = i;
        break;
      }
    }
    if(present==false){
      throw "Error: Request Id not found";
   }
   let lend = lendHistory[idx];
   lend.isPending = 0;
   await lendHistoryRegistry.update(lend);
   
    let requestId = lend.request.toString().split("#")[1].split("}")[0];
    
    let requestRegistry = await getAssetRegistry("org.p2plending.model.Request");
    let request = await requestRegistry.get(requestId);           
    
    let amountPaid = request.amount + Math.floor((request.amount*request.interest)/100);
    let receiverId = request.receiver.toString().split("#")[1].split("}")[0];
    let senderId = lend.sender.toString().split("#")[1].split("}")[0];
    
    let participantRegistry = await getParticipantRegistry('org.p2plending.model.Person');
    let sender = await participantRegistry.get(receiverId);
    if(sender.balance < amountPaid){
      throw "Not enough balance to send";
    }
    sender.balance -= amountPaid;
    await participantRegistry.update(sender);
    let receiver = await participantRegistry.get(senderId);
    receiver.balance += amountPaid;
    await participantRegistry.update(receiver);
  }
  