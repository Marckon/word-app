var list = loadList();// 加载单词文件
var En = list.En;// 得到单词的英文部分
var Ch = list.Ch;// 得到单词的中文部分
$(document).ready(function () {
    createTable(En, Ch, 0);// 创建单词表，0表示循环起始值（实际工作用不到他，考虑递归采用，但递归方法容易卡死）
    var user_input = $('.user-input');//  获得用户输入框元素
    var last_res = loadLastResult('flag');// 加载之前的页面数据（错误的数组）
    var final_index = loadLastResult('final_index');// 加载上次最后一个输入的单词
    showPreviousPage(last_res, final_index, En);// 展示之前的页面样式


    // 进行单词检查
    user_input.on('keyup', function (e) {
        var Ch = $('.translation');
        var index = user_input.index(this);// 取得当前输入框的索引
        saveResult(final_index, index.toString(), 'final_index');// 储存最后一个（即当前）输入的单词的索引（数组最后一个值是我们所需要的）
        if (e.keyCode == 13) {//  输入回车开始检查
            if (this.value == En[index]) {// 若结果正确
                var addition=$("<td class='addition'></td>");
                $(this).parent().append($(addition).html(En[index]));
                this.disabled = true;// 输入框禁用，但实际效果看不到他
                this.parentNode.innerHTML = En[index];// 父元素（td）显示英文单词部分
                user_input[index + 1].focus();// 输入框聚焦到下一个单词
            } else {
                this.parentNode.getElementsByTagName('span')[0].innerHTML = '×';// 输入错误在输入框后的span元素输出提示
                $(Ch[index]).css({
                    color: 'red'
                });// 输入错误标红
                saveResult(last_res, index.toString(), 'flag');// 实时储存输入错误的结果
            }
        }
    });

    // 给单词板绑定滚轮事件
    $('.main-panel').on('mousewheel', function (e) {
        var panel_position = $('.main-panel').scrollTop();// 获得单词版当前滚动条顶部位置
        if (e.originalEvent.wheelDelta > 0) {//  使用originalevent 指向js的原始对象，jq不支持wheeldelta
            $('.main-panel').scrollTop(panel_position - $('.main-panel').height());// 每次移动一个面板的距离
        }
        if (e.originalEvent.wheelDelta < 0) {
            $('.main-panel').scrollTop(panel_position + $('.main-panel').height());
        }
    });

    //  给右侧两个按钮绑定事件，同上滚轮事件
    $('#down').on('click', function () {
        var panel_position = $('.main-panel').scrollTop();
        $('.main-panel').scrollTop(panel_position + $('.main-panel').height());
    });
    $('#up').on('click', function () {
        var panel_position = $('.main-panel').scrollTop();
        $('.main-panel').scrollTop(panel_position - $('.main-panel').height());
    })
});

function loadList() {
    htmlobj = $.ajax({url: 'words.txt', async: false});
    var En = htmlobj.responseText.match(/((\w|[\u00C0-\u00FF]|[']|[-])+\s)+/g).toString();// 匹配所有英文单词并转换为一个字符串对象
    var En_trans = En.replace(/\s+[,]/g, '*'); // 将单词字符串对象的逗号全部换成*号
    var En1 = En_trans.split('*');// 将替换后的字符串以*分解为数组
    for (var i = 0; i < En1.length; i++) {
        if (En1[i] == "") {
            En1.splice(i, 1);
        }
    }// 删除数组中的空元素

    var Ch = htmlobj.responseText.replace(/((\w|[\u00C0-\u00FF]|[']|[-])+\s)+/g, ' ').toString();// 匹配所有英文单词并替换为空格形成中文字符串对象
//            Ch.replace(/'僵尸词'/, '');// 将僵尸词替换为空格似乎无效
    Ch1 = Ch.split(/\s+/);// 以空格分解中文字符串为数组
    for (var i = 0; i < Ch1.length; i++) {
        if (Ch1[i] == "" || Ch1[i] == '僵尸词') {
            Ch1.splice(i, 1);
        }
    }// 删除数组中的空元素和僵尸词标题
    /*    alert(Ch1.length + ' ' + En1.length);
        alert(En1[392] + Ch1[392]);*/
    var list = {
        En: En1,
        Ch: Ch1
    };// 定义list对象
    return list;
}

function createTable(words, translations, start_index) {
    var list_height = $('.main-panel').height();
    var word_height = 40;// css中td的高度
    var word_num = Math.floor(list_height / word_height);// 得到一个列的单词数
    var line_num = words.length / word_num;// 得到单词列数
    for (var j = start_index; j < line_num; j++) {// 外循环控制列数
        var table_container = $('<div class="table"></div>');
        $('.main-panel').append(table_container);
        var table = $('<table ></table>');
        table_container.append(table);
        for (var i = j * word_num; i < (word_num + j * word_num); i++) {// 内循环，控制每列单词数
            var tr = $('<tr></tr>');
            var Input = $('<td><input class="user-input" type="text"><span></span></td>');
            var Ch = $('<td class="translation"></td>').html(translations[i]);
            Ch.attr('title', words[i]);// 鼠标悬停指示答案结果
            tr.append(Ch);
            tr.append(Input);
            table.append(tr);
            /*if (table_container.height() >= $('.main-panel').height()) {
                createTable(words, translations, i);
            } //这样迭代容易卡死，不推荐*/
        }
    }
}

function loadLastResult(key) {
    var storage_flag = localStorage.getItem(key);
    if (storage_flag == null || storage_flag == undefined) {
        storage_flag = new Array();// 之前没有储存则创建用于储存上次测试状态的标记数组
    } else {
        storage_flag = JSON.parse(storage_flag);
    }
    return storage_flag;
}

function saveResult(last_content, current_content, key) {
    if (last_content.indexOf(current_content) < 0) {// 判断是否已存在当前值
        last_content.push(current_content);// 将错误结果储存在标记数组中
    }
    last_content.sort(function (a, b) {
        return a - b;
    });// 将得到的数组进行排序
    localStorage.setItem(key, JSON.stringify(last_content));// 储存
}

function showPreviousPage(resultObj, final_flag, data) {
    var Ch = $('.translation');
    var En = $('.user-input');
    // 显示上次输入错误的单词
    for (var i = 0; i < resultObj.length; i++) {
        $(Ch[resultObj[i]]).css(
            {
                color: 'red'
            });
    }
    // 显示上次输入的最后一个单词之前所有的单词
    for (var j = 0; j < final_flag[final_flag.length - 1]; j++) {
        En[j].parentNode.innerHTML = data[j];
    }
}

function rewrite() {
    var inputTd=$('.translation').next().html("");
    var input=$('<input class="user-input" type="text">');
    inputTd.append(input);
}

function showWords() {
    var wordsAreas=$('.user-input');
    for (var i=0;i<wordsAreas.length;i++){
        wordsAreas[i].parentNode.innerHTML=En[i];
    }
}