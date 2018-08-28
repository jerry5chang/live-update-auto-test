<template>
    <div>
        <div id="pageMask" style="display: none"></div>
        <div class="btnContainer">
            <input class="textInput" id="importFwVersion" placeholder="Firmware File Name" type="text">
            <input class="textInput" id="firmwareMD5" maxlength="32" placeholder="MD5" type="text">
            <input id="isREQ" type="checkbox">REQ
            <div class="button" id="updateBtn" @click="update()"></div>
            <div class="button" id="saveBtn" @click="saveInfo()"></div>
            <div class="button" id="checkAllBtn" @click="checkAll()"></div>
        </div>

        <table class="infoTable" cellspacing=0 border="1px">
            <tr class="headerBar">
                <td style="width:10%;" class="header">MODEL</td>
                <td style="width:5%;" class="header">REQFW</td>
                <td style="width:10%;" class="header">REQEXT</td>
                <td style="width:5%;" class="header">FW</td>
                <td style="width:10%;" class="header">EXT</td>
                <td style="width:5%;" class="header donotshow">URL</td>
                <td style="width:5%;" class="header donotshow">UT</td>
                <td style="width:5%;" class="header donotshow">BETAFW</td>
                <td style="width:10%;" class="header donotshow">BETAEXT</td>
                <!--td>Note</td-->
                <td style="width:10%;" class="header notInfo">MD5</td>
                <td style="width:15%;" class="header notInfo alignCenter">Status</td>
                <td style="width:5%;" class="header notInfo alignCenter">Remove</td>
            </tr>
            
            <template v-for="item in versionInfo">
                <tr v-bind:id="item.MODEL">
                    <td name="MODEL">{{item.MODEL}}</td>
                    <td class="editable" name="REQFW">{{item.REQFW}}</td>
                    <td class="editable" name="REQEXT">{{item.REQEXT}}</td>
                    <td class="editable" name="FW">{{item.FW}}</td>
                    <td class="editable" name="EXT">{{item.EXT}}</td>
                    <td class="donotshow" name="URL">{{item.URL}}</td>
                    <td class="donotshow" name="UT">{{item.UT}}</td>
                    <td class="editable donotshow" name="BETAFW">{{item.BETAFW}}</td>
                    <td class="editable donotshow" name="BETAEXT">{{item.BETAEXT}}</td>
                    <!--td>{{item.Note}}</td-->
                    <td class="editable notInfo md5" name="MD5">{{item.MD5}}</td>
                    <td class="notInfo checkStatus alignCenter" @click="checkFw($event)">{{item.STATUS}}</td>
                    <td class="notInfo alignCenter" @click="remove($event)"><div class="removeBtn button">-</div></td>
                </tr>
            </template>
        </table>
    </div>
</template>

<script>
const msgRef = firebase.database().ref('test');

export default {
    name: 'ReleaseNote',

    data() {
        return {
            versionInfo: []
        }
    },

    methods: {
        saveInfo() {
            const vm = this;
            var infoHeader = [];
            var modelInfo = [];

            function download(text) {
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                element.setAttribute('download', "wlan_update_v2.zip");
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }

            $(".infoTable").find($("tr")).each(function(i, model){
                if($(this).attr("class") === "headerBar"){
                    $(model).find($("td")).each(function(j, item){
                        if($(item).hasClass("notInfo")) return true;
                        infoHeader.push($(item).html())
                    })
                    return true;
                }

                $(model).find($("td")).each(function(j, item){
                    if($(item).hasClass("notInfo")) return true;
                    if(infoHeader[j].indexOf("REQ") !== -1 && $(item).html() === "") return true;

                    modelInfo.push(infoHeader[j] + $(item).html())
                })

                modelInfo.push("")
            })

            download(modelInfo.join("#").replace("MODEL", "").replace(/#MODEL/g, "\n\r"))
        },

        update() {
            var postData = {};
            var importFwVersion = $("#importFwVersion").val()
            var splitSharp = importFwVersion.split("#");
            var splitUnderline = importFwVersion.split("_");

            if(splitSharp.length > 1){
                if(splitSharp.length < 10){
                    splitSharp.insert(1, "REQFW")
                    splitSharp.insert(2, "REQEXT")
                }

                postData.MODEL = splitSharp[0];
                postData.REQFW = splitSharp[1].replace("REQFW", "");
                postData.REQEXT = splitSharp[2].replace("REQEXT", "");
                postData.FW = splitSharp[3].replace("FW", "");
                postData.EXT = splitSharp[4].replace("EXT", "");
            }
            else{
                postData.MODEL = splitUnderline[0];
                postData.FW = splitUnderline[1].replace(/\./g, '') + splitUnderline[2];
                postData.EXT = splitUnderline[3].split(".")[0];
            }

            if($("#isREQ").is(":checked")){
                postData.REQFW = postData.FW;
                postData.REQEXT = postData.EXT
            }

            postData.UT = "4208";
            postData.MD5 = ($("#firmwareMD5").val() === "") ? "NO_INFO" : $("#firmwareMD5").val();
 
            msgRef.child(postData.MODEL).update(postData)

            $("#importFwVersion").val("")
            $("#firmwareMD5").val("")
        },

        checkFw(event) {
            var modelName = $(event.currentTarget).parent().attr("id");
            var target = this.versionInfo[modelName];
            var $this = $(event.currentTarget);

            $this
                .css({"background-color": "#FFF"})
                .html("<img src='/static/image/loading.gif'>");

            $.ajax({
                url: "http://localhost:3000/liveUpdateTest.cgi",
                data: {
                    MODEL: target.MODEL,
                    FW: target.FW,
                    EXT: target.EXT,
                    TYPE: "note",
                    MD5: target.MD5,
                },
                success: function(res){
                    if(res.indexOf("No") !== -1){
                        $this.css({"background-color":"#FCC"})
                    }
                    else if(res.indexOf("MD5") !== -1){
                        $this.css({"background-color":"#FDF986"})
                    }
                    else{
                        $this.css({"background-color":"#FFF"})
                    }

                    $this.html(res);
                    msgRef.child(target.MODEL).update({"STATUS": res});
                }
            })
        },

        checkAll() {
            $(".checkStatus")
                .css({"background-color":"#FFF"})
                .each(function(i, item){$(item).click();})
        },

        remove() {
            var modelName = $(event.currentTarget).parent().attr("id");
            var target = this.versionInfo[modelName];
            msgRef.child(target.MODEL).remove();        
        },

        updateMD5() {
            var modelName = $(event.currentTarget).parent().attr("id");
            var target = this.versionInfo[modelName];

            $.ajax({
                url: "http://localhost:3000/updateMD5.cgi",
                data: {
                    MODEL: target.MODEL,
                    FW: target.FW,
                    EXT: target.EXT,
                },
                success: function(res){
                    msgRef.child(target.MODEL).update({"MD5": res});
                }
            })
        }
    },

    mounted() {
        const vm = this;
        msgRef.on('value', function(data) {
            const val = data.val();
            vm.versionInfo = val;
        })
    },

    updated() {
        $(".editable").click(function(){
            if($(this).find($("input")).length != 0) return false;

            var cachedVal = $(this).html();
            var editInput = $('<input>');

            $(this).html(editInput)
            editInput
                .css({
                    "width": "95%",
                    "height": "20px",
                    "padding": "5px",
                    "border": "0px",
                    "border-bottom": "1px solid #CCC",
                    "font-family": "monospace"
                })
                .blur(function(){
                    var cachedVal = $(this).val();
                    var modelName = $(this).parent().parent().attr("id");
                    var header = $(this).parent().attr("name");

                    msgRef.child(modelName).update(JSON.parse('{"' + header +  '":"' + cachedVal + '"}'));
                    $(this).parent().html(cachedVal)
                    $("#pageMask").hide()                    
                })
                .val(cachedVal)
                .focus()

            $("#pageMask").show()
        })

        $("#pageMask").click(function(){
            $(this).hide()
        })

        $(".checkStatus").each(function(i, item){
            var status = $(item).html()
            if($(item).html().indexOf("No") !== -1){
                $(item).css({"background-color":"#FCC"})
            }
            else if($(item).html().indexOf("MD5") !== -1){
                $(item).css({"background-color":"#FDF986"})
            }
            else{
                $(item).css({"background-color":"#FFF"})
            }
        })
    }
}
</script>

<style scoped>
    tr:hover{
/*
        background-color: #FC0 !important;
*/
    }
    #pageMask{
        width: 100%;
        height: 100%;
        position: fixed;
    }
    .infoTable{
        margin-top: 20px;
        text-align: left;
        font-family: monospace;
        width: 100%;
    }
    .infoTable td{
        padding: 10px;
        height: 35px;
    }
    .header{
        height: 20px !important;
        background: #DDD;
    }
    .btnContainer{
        width: 100%;
        text-align: center;
        margin-top: 20px
    }
    .button{
        font-family: monospace;
        display: inline-table;
        line-height: 50px;
        background-color: #05F;
        border-radius: 3px;
        color: #FFF;
        cursor: pointer;
        margin-left: 10px;
        border-radius: 50px;
        width: 50px;
        height: 50px;
        font-size: 36px;
        cursor: pointer;
        vertical-align: bottom;
    }
    .button:hover{
        background-color: #F00;
    }
    .removeBtn{
        font-weight: bold;
        width:20px;
        height:20px;        
        border-radius: 20px;
        color: #FFF;
        margin: auto;
        font-size: 20px;
        line-height: 16px;
    }
    #saveBtn{
        background: url(/static/image/download.png) no-repeat;
        background-size: cover;
    }
    #checkAllBtn{
        background: url(/static/image/check.png) no-repeat;
        background-size: cover;
    }
    #updateBtn{
        background: url(/static/image/add.png) no-repeat;
        background-size: cover;
    }
    .editTextInput{
        width:95%;
        height:20px;
        padding:5px;
        border: 0px;
        border-bottom: 1px solid #CCC;
        font-family: monospace;
    }
    .textInput{
        width:300px;
        height:20px;
        padding:5px;
        border: 0px;
        border-bottom: 1px solid #CCC;
        font-family: monospace;
    }
    .donotshow{
      display: none;
    }
    .checkStatus{
        cursor: pointer;
        color: blue;
        text-decoration: underline;
        word-break: break-word;
    }
    .alignCenter{
        text-align: center;
    }
    .md5{
        word-break: break-all;
    }
</style>