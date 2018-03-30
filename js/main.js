/**
 * Created by zws on 2016/9/25.
 */
var board = [];
var score = 0;
var hasCollide = []; // 检测当前格是否已发生碰撞生成新的数

var startx=0;
var starty=0;
var endx=0;
var endy=0;

var isOver = 0;
var startTime = "";
var sendUrl = "https://daily.vicp.io/mycorp/act/testsendmessage.php";
var currentHighScore = 0;

$(document).ready(function(){
    prepareForMobile();
    newGame();
});

function prepareForMobile(){
    if(documentWidth<768){
        $("#grid-container").css({
            'width': gridContainerWidth-2*cellSpace,
            'height': gridContainerWidth-2*cellSpace,
            'padding': cellSpace,
            'border-radius': 0.02*gridContainerWidth
        });
        $(".grid-cell").css({
            'width': cellSideLength,
            'height': cellSideLength,
            'border-radius': 0.02*cellSideLength
        });

    }
}

function getDate()//获取当前日期时间
{
	var date = new Date();
	return date.getFullYear().toString()+"年"+(date.getMonth()+1).toString()+"月"+date.getDate().toString()+"日"+date.getHours().toString()+":"+date.getMinutes().toString()+":"+
    date.getMinutes().toString();
}

function getHighScore()//获取当前最高分(实际是合并成的最大数，不是score分数)
{
	var maxScore = 0;
	for(var i=0;i<4;i++)
	{
        for(var j=0;j<4;j++)
		{
            if(board[i][j]>maxScore)
			{
				maxScore = board[i][j];
			}
		}
	}
	return maxScore;
}

function sendHighScore()//发送当前最高分(实际是合并成的最大数，不是score分数)
{
	var maxScore = getHighScore();
	if(maxScore>currentHighScore)
	{
		currentHighScore = maxScore;
		$.get(sendUrl,{"data":"2048当前最高分更新:\n开始时间:"+startTime+"\n当前最高分:"+currentHighScore});
	}
}

function newGame(){
//   初始化棋盘
    init();
//    随机生成数字
    generateOneNumber();
    generateOneNumber();
	
	sendHighScore();
}

function init(){
    for(var i=0;i<4;i++){
        for(var j=0;j<4;j++){
            var cell = $('#grid-cell-'+i+'-'+j);
            cell.css('top',getTop(i,j));
            cell.css('left',getLeft(i,j));
        }
    }

    for(var i=0;i<4;i++){
        board[i]=new Array();
        hasCollide[i] = new Array();
        for(var j=0;j<4;j++){
            board[i][j]=0;
            hasCollide[i][j] = false;
        }
    }
    updateBoardView();
    score = 0;
    updateScore(score);
	
	isOver = 0;
	currentHighScore = 0;
	startTime = getDate();//初始化starttime变量，标记此局的开始时间
	$.get(sendUrl,{"data":"2048游戏开始\n开始时间:"+startTime});
}

// 根据数组渲染棋盘
function updateBoardView(){

    $(".number-cell").remove();
    for(var i=0;i<4;i++)
    {
        for(var j=0;j<4;j++){
            $("#grid-container").append('<div class="number-cell" id="number-cell-'+i+'-'+j+'"></div>');
            var numberCell = $('#number-cell-'+i+'-'+j);

            if(board[i][j] == 0){
                numberCell.css({
                    'font-size': 0.25*cellSideLength+'px',
                    'width':'0px',
                    'height':'0px',
                    'left': getLeft(i,j)+0.5*cellSideLength,
                    'top': getTop(i,j)+0.5*cellSideLength
                })
            }
            else{
                numberCell.css({
                    'font-size': 0.25*cellSideLength+'px',
                    'width': cellSideLength,
                    'height': cellSideLength,
                    'left': getLeft(i,j),
                    'top': getTop(i,j),
                    'background-color': getNumberBackgroundColor(board[i][j]),
                    'color': getNumberColor(board[i][j])
                }).text(board[i][j]);
            }

            hasCollide[i][j] = false;
        }
    }

    if(documentWidth<768){
        $(".number-cell").css({

            'font-size': 0.25*cellSideLength+'px',
            'line-height': cellSideLength+'px',
            'border-radius': 0.02*cellSideLength
        })
    }
}

function generateOneNumber(){
    if(nospace(board))
        return false;

    //随机一个位置
    var randx = parseInt(Math.floor(Math.random() * 4));
    var randy = parseInt(Math.floor(Math.random() * 4));
    while(true){
        if(board[randx][randy] == 0)
            break;
        randx = parseInt(Math.floor(Math.random() * 4));
        randy = parseInt(Math.floor(Math.random() * 4));
    }

    //随机一个数字
    var randNumber = Math.random() < 0.5?2:4;

    //在随机的位置显示随机数字
    board[randx][randy]=randNumber;
    showNumberWithAnimation(randx,randy,randNumber);

    return true;
}

$(document).keydown(function(event){

    switch(event.keyCode) {
        case 37: // left
            event.preventDefault();
            if(moveLeft()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
            break;
        case 38: //up
            event.preventDefault();
            if(moveUp()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
            break;
        case 39: //right
            event.preventDefault();
            if(moveRight()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
            break;
        case 40: // down
            event.preventDefault();
            if(moveDown()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
            break;
        default:
            break;
    }
	sendHighScore();
});

var gridobj = document.getElementById('grid-container');

gridobj.addEventListener('touchstart',function(event){
    startx = event.touches[0].pageX;
    starty = event.touches[0].pageY;
});

gridobj.addEventListener('touchmove',function(event){
    event.preventDefault();
});

gridobj.addEventListener('touchend',function(event){
    endx = event.changedTouches[0].pageX;
    endy = event.changedTouches[0].pageY;

    var deltax = endx-startx;
    var deltay = endy-starty;

    if(Math.abs(deltax)<0.03*documentWidth && Math.abs(deltay)<0.03*documentWidth){
        return;
    }
    if(Math.abs(deltax)>=Math.abs(deltay)){
    //    x
        if(deltax>0){
        //    move right
            if(moveRight()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
        }
        else{
        //    move left
            if(moveLeft()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
        }
    }
    else{
    //    y
        if(deltay>0){
        //    move down
            if(moveDown()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
        }
        else{
        //    move up
            if(moveUp()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
        }
    }
	sendHighScore();
});

function isgameover(){
    if(nospace(board) && nomove(board) && isOver==0)
	{
		isOver = 1;
		$.get(sendUrl,{"data":"2048游戏结束\n开始时间:"+startTime+"\n结束时最高分数:"+currentHighScore});
		gameover();
	}
}

function gameover(){
    alert('瑜宝宝，游戏结束了耶！');
}

function moveLeft(){

    if(!canMoveLeft(board))
        return false;

//    move left operate
    for(var i=0;i<4;i++){
        for(var j=1;j<4;j++){
            if(board[i][j]!=0){

               for(var k=0;k<j;k++){
                   if(board[i][k] == 0 && noBlockHorizontal(i,k,j,board)){
                   //    move
                       showMoveAnimation(i,j,i,k);
                       board[i][k]=board[i][j];
                       board[i][j]=0;

                       continue;
                   }
                   else if(board[i][k] == board[i][j] && noBlockHorizontal(i,k,j,board) && !hasCollide[i][k]){
                   //    move
                       showMoveAnimation(i,j,i,k);
                   //    add
                       board[i][k]=board[i][j]*2;
                       board[i][j]=0;
                       // update score
                       score += board[i][k];
                       updateScore(score);
                       hasCollide[i][k] = true;
                       continue;
                   }
               }
            }
        }
    }

    setTimeout("updateBoardView()",200);

    return true;
}

function moveRight(){

    if(!canMoveRight(board))
        return false;

//    move right
    for(var i=0;i<4;i++){
        for(var j=2;j>=0;j--){
            if(board[i][j]!=0){

                for(var k=3;k>j;k--){
                    if(board[i][k]==0 && noBlockHorizontal(i,j,k,board)){
                        showMoveAnimation(i,j,i,k);
                        board[i][k]=board[i][j];
                        board[i][j]=0;

                        continue;
                    }
                    else if(board[i][k]==board[i][j] && noBlockHorizontal(i,j,k,board) && !hasCollide[i][k]){
                        //    move
                        showMoveAnimation(i,j,i,k);
                        //    add
                        board[i][k]=board[i][j]*2;
                        board[i][j]=0;
                        score += board[i][k];
                        updateScore(score);
                        hasCollide[i][k] = true;
                        continue;
                    }
                }
            }
        }
    }

    setTimeout("updateBoardView()",200);
    return true;
}

function moveUp(){

    if(!canMoveUp(board))
        return false;

//    move up operate
    for(var i=1;i<4;i++){
        for(var j=0;j<4;j++){
            if(board[i][j]!=0){

                for(var k=0;k<i;k++){
                    if(board[k][j]==0 && noBlockVertical(j,k,i,board)){
                    //    move
                        showMoveAnimation(i,j,k,j);
                        board[k][j]=board[i][j];
                        board[i][j]=0;
                        continue;
                    }
                    else if(board[k][j]==board[i][j] && noBlockVertical(j,k,i,board) && !hasCollide[k][j]){
                    //    move
                        showMoveAnimation(i,j,k,j);
                    //    add
                        board[k][j]=board[i][j]*2;
                        board[i][j]=0;
                        score += board[k][j];
                        updateScore(score);
                        hasCollide[k][j] = true;
                        continue;
                    }
                }
            }
        }
    }

    setTimeout("updateBoardView()",200);
    return true;
}

function moveDown() {
    if (!canMoveDown(board))
        return false;

//    move down
    for(var i=2;i>=0;i--){
        for(var j=0;j<4;j++){
            if(board[i][j]!=0){

                for(var k=3;k>i;k--){
                    if(board[k][j]==0 && noBlockVertical(j,i,k,board)){
                        showMoveAnimation(i,j,k,j);
                        board[k][j]=board[i][j];
                        board[i][j]=0;
                        continue;
                    }
                    else if(board[i][j]==board[k][j] && noBlockVertical(j,i,k,board) && !hasCollide[k][j]){
                        //    move
                        showMoveAnimation(i,j,k,j);
                        //    add
                        board[k][j]=board[i][j]*2;
                        board[i][j]=0;
                        score += board[k][j];
                        updateScore(score);
                        hasCollide[k][j] = true;
                        continue;
                    }
                }
            }
        }
    }

    setTimeout("updateBoardView()",200);
    return true;
}