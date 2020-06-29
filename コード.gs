// LINE developersのメッセージ送受信設定に記載のアクセストークン
var lineToken = '************************************************';

//
// <https://blog.adachin.me/archives/10188> を参考に作成
//

var get_interval = 1; //〇分前～現在の新着メールを取得 #--トリガーをこれに合わせておく！！
 
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
  var time_term = now_time - (60 * get_interval); //変換
 
  //検索条件指定
  //var strTerms = '(is:unread from:machinist-noreply@iij.ad.jp after:'+ time_term + ')';
  //var strTerms = '(is:unread from:machinist-noreply@iij.ad.jp after:'+ time_term.toString() + ')';
  var strTerms = '(is:unread subject:"Machinist 監視" after:'+ time_term.toString() + ')';
  //var strTerms = 'subject:"Machinist 監視" after:1593319482';
  console.log(strTerms);
  
  //取得
  var myThreads = GmailApp.search(strTerms);
  var myMsgs = GmailApp.getMessagesForThreads(myThreads);
  var valMsgs = [];
  console.log("length: " + myMsgs.length);
  for(var i = 0; i < myMsgs.length;i++){
    console.log("i: " + i);
    strBody = myMsgs[i][0].getPlainBody().slice(0, 200); // 本文の取得。
    newState = strBody.match(/->.*?\r/g)[0].replace('->', '').replace(/\s*/, '').replace('\r', '');
    console.log("newState: " + newState);
    console.log("type of newState: " + typeof(newState))

    valMsgs[i] = "";
    //valMsgs[i] = "\n【date】: " + myMsgs[i][0].getDate();
    /*
    valMsgs[i] = "\n【date】: " + myMsgs[i][0].getDate()　
                  + "\n【From】: " + myMsgs[i][0].getFrom()
                  + "\n【Subject】: " + myMsgs[i][0].getSubject()
                  + "\n【Body】: \n" + myMsgs[i][0].getPlainBody().slice(0,200);
    */
    // myMsgs[i].markRead(); //メッセージを既読にする
    valMsgs[i] = valMsgs[i] + "\n" + "じゃじゃじゃ";
    valMsgs[i] = valMsgs[i] + "\n" + newState;
    console.log("valMsg: " + valMsgs[i])

    if(newState.match(/熱い/) || newState.match(/さむい/)){
      temperature = strBody.match(/条件:\s*[0-9.]*/)[0].replace(/条件:\s*/, '').substr(0, 5);
      valMsgs[i] = valMsgs[i] + "\n" + temperature + "度です";
    }
  
    console.log("valMsg: " + valMsgs[i])
  }
  for(var i = 0; i < myThreads.length; i++){
    myThreads[i].markRead()
  }
 
  console.log(valMsgs);
  return valMsgs;
 
}
 
function main() {
  new_Me = fetchContactMail()
  if(new_Me.length > 0){
    for(var i = new_Me.length-1; i >= 0; i--){
      send_line(new_Me[i])
    }
  }
}