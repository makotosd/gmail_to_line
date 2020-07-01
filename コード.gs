//
// <https://blog.adachin.me/archives/10188> を参考に作成
//
var get_interval = 10; //〇分前～現在の新着メールを取得 #--トリガーをこれに合わせておく！！
var lineToken = '';
function get_token(){
  var fileName = "line-family-pp.json.txt";
  var files = DriveApp.getFilesByName(fileName);
  if (files.hasNext()) {
    var file = files.next();
    var content = file.getBlob().getDataAsString();
    json = JSON.parse(content);
    lineToken = json[0]["pp"]
  }
}

 
function send_line(Me){
  var payload = {'message' :   Me};
  var options ={
        "method"  : "post",
        "payload" : payload,
        "headers" : {"Authorization" : "Bearer "+ lineToken}  
      };
    UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
}
 
 
function fetchContactMail() {
  //取得間隔
  var now_time= Math.floor(new Date().getTime() / 1000) ;//現在時刻を変換
  var time_term = now_time - (60 * get_interval * 2); //変換
 
  //検索条件指定
  //var strTerms = '(is:unread from:machinist-noreply@iij.ad.jp after:'+ time_term + ')';
  //var strTerms = '(is:unread from:machinist-noreply@iij.ad.jp after:'+ time_term.toString() + ')';
  var strTerms = '(subject:"Machinist 監視" after:'+ time_term.toString() + ')';
  //var strTerms = 'subject:"Machinist 監視" after:1593591245';
  console.log(strTerms);
  
  //取得
  var myThreads = GmailApp.search(strTerms);
  var myMsgs = GmailApp.getMessagesForThreads(myThreads);
  var valMsgs = [[]];
  console.log("length: " + myMsgs.length);
  for(var i = 0; i < myMsgs.length;i++){
    for(var j = 0; j < myMsgs[i].length; j++){
      
      if(myMsgs[i][j].isStarred() != true){
        console.log("Message on " + myMsgs[i][j].getDate() + " is NOT starred");
        strBody = myMsgs[i][j].getPlainBody().slice(0, 200); // 本文の取得。
        newState = strBody.match(/->.*?\r/g)[0].replace('->', '').replace(/\s*/, '').replace('\r', '');
        console.log("newState: " + newState);
        console.log("type of newState: " + typeof(newState))
        
        valMsgs[i][j] = "";
        //valMsgs[i] = "\n【date】: " + myMsgs[i][0].getDate();
        /*
        valMsgs[i] = "\n【date】: " + myMsgs[i][0].getDate()　
        + "\n【From】: " + myMsgs[i][0].getFrom()
        + "\n【Subject】: " + myMsgs[i][0].getSubject()
        + "\n【Body】: \n" + myMsgs[i][0].getPlainBody().slice(0,200);
        */
        // myMsgs[i].markRead(); //メッセージを既読にする
        valMsgs[i][j] = valMsgs[i][j] + "\n" + "じゃじゃじゃ";
        valMsgs[i][j] = valMsgs[i][j] + "\n" + newState;
        
        if(newState.match(/熱い/) || newState.match(/さむい/)){
          temperature = strBody.match(/条件:\s*[0-9.]*/)[0].replace(/条件:\s*/, '').substr(0, 5);
          valMsgs[i][j] = valMsgs[i][j] + "\n" + temperature + "度です";
        }
        
        console.log("valMsg: " + valMsgs[i][j])
        myMsgs[i][j].star();
      }else{
        console.log("Message on " + myMsgs[i][j].getDate() + " is starred");
      }
    }
  }
  for(var i = 0; i < myThreads.length; i++){
    myThreads[i].markRead()
  }
 
  return valMsgs;
}
 
function main() {
  get_token();
  new_Me = fetchContactMail()
  if(new_Me.length > 0){
    for(var i = 0; i < new_Me.length; i++){
      for(var j = 0; j < new_Me[i].length; j++){
        if(new_Me[i][j] != null){ 
          send_line(new_Me[i][j])
          console.log("i, j: " + i + ", " + j + ": send msg thru line: " + new_Me[i][j])
        }else{
          console.log("i, j: " + i + ", " + j + ": value is empty")
        }
      }
    }
  }
}