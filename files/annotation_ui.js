var currentDoc = 0;
var currentTab = 0;
var totalTabs = 4;
var currentComment = -1;
var isStarted = false;

function nextComment() {
    if (currentComment < totalComments - 1) {
        currentComment++;
        showComment(currentComment);
    }
    if (currentComment == totalComments - 1) {
        document.getElementById('nextCommentButton').classList.add('hidden');
        document.getElementById('startButton').disabled = false;
        document.getElementById('startButton').style.display = "block";
    }
}

function showComment(commentNum) {
    var comments = document.getElementsByClassName('comment');
    for (var i = 0; i < comments.length; i++) {
        comments[i].classList.add('hidden');
    }
    comments[commentNum].classList.remove('hidden');
}

function nextTab() {
    if (currentTab < totalTabs - 1) {
        currentTab++;
        var tabs = ['Instructions', 'Example1', 'Example2', 'Disclaimers'];
        switchTab(tabs[currentTab]);
    }
    if (currentTab == totalTabs - 1) {
        document.getElementById('nextTabButton').classList.add('hidden');
        document.getElementById('closeTabButton').classList.remove('hidden');
    }
    if (currentTab > 0) {
        document.getElementById('previousTabButton').classList.remove('hidden');
    }
}

function prevTab() {
    if (currentTab > 0) {
        currentTab--;
        var tabs = ['Instructions', 'Example1', 'Example2', 'Disclaimers'];
        switchTab(tabs[currentTab]);
    }
    if (currentTab < totalTabs - 1) {
        document.getElementById('nextTabButton').classList.remove('hidden');
        document.getElementById('closeTabButton').classList.add('hidden');
    }
    if (currentTab == 0) {
        document.getElementById('previousTabButton').classList.add('hidden');
    }
}

function switchTab(tabNum) {
    var tabs = ['Instructions', 'Example1', 'Example2', 'Disclaimers'];
    var i, tabcontent;
    tabcontent = document.getElementsByClassName('tab-content');
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    if (typeof tabNum === 'number') {
        document.getElementById(tabs[tabNum]).style.display = 'block';
    } else if (typeof tabNum === 'string') {
        document.getElementById(tabNum).style.display = 'block';
    }
}

function prevDoc() {
    if (currentDoc > 0) {
        currentDoc--;
        showDoc(currentDoc);
    }
    if (currentDoc < totalDocs - 1) {
        document.getElementById('nextButton').textContent = 'Next >';
        document.getElementById('nextButton').classList.remove('hidden');
        document.getElementById('submitButton').classList.add('hidden');
    }
    setTimeout(checkRadioSelected(), 100);
}


var visitedDocs = [];

function showDoc(docNum) {
    resetHighlight();
    if (docNum == 0) {
        document.getElementById('column2').classList.remove('hidden');
    }
    if (docNum > 0) {
        document.getElementById('highlightCheckWrap').classList.remove('hidden');
    }
    var docs = document.getElementsByClassName('annotation');
    for (var i = 0; i < docs.length; i++) {
        docs[i].classList.add('hidden');
    }
    docs[docNum].classList.remove('hidden');
    document.getElementById('docIndicator').textContent = (docNum + 1) + ' / ' + totalDocs;
    checkRadioSelected();
    var summaryText = document.querySelector('textarea').value;
    var wordCount = summaryText.split(' ').filter(function(n) { return n != '' }).length;
    document.getElementById('summaryCheck').innerHTML = wordCount >= 5 ? '✅' : '❌';
    var evidence = document.getElementById('evidence_' + docNum).value;
    evidence = evidence ? JSON.parse(evidence) : [];
    var comments = document.getElementsByClassName('comment');
    for (var i = 0; i < comments.length; i++) {
        comments[i].innerHTML = originalTexts[i];
    }
    for (var i = 0; i < evidence.length; i++) {
        var comment = document.getElementById('comment_' + evidence[i].comment_id);
        var text = comment.innerHTML;
        var highlightedText = '<mark>' + evidence[i].text + '</mark>';
        comment.innerHTML = text.replace(evidence[i].text, highlightedText);
    }
    var element = document.getElementById('highlightCheck');
    if (element) {
        element.innerHTML = checkHighlight() ? '✅' : '❌';
    }
}

function highlightText() {
    var docNum = currentDoc - 1;
    if (!isStarted) {
        return;
    }
    var selectedText = window.getSelection();
    if (selectedText.rangeCount > 0) {
        var range = selectedText.getRangeAt(0);
        var parentElementId = range.commonAncestorContainer.parentElement.parentElement.id;
        var wordCount = range.toString().split(' ').filter(function(n) { return n != '' }).length;
        if (wordCount < 4) {
            alert('Please highlight at least 4 words.');
            return;
        }
        document.designMode = "on";
        selectedText.addRange(range);
        var evidence = document.getElementById('evidence_' + docNum).value;
        evidence = evidence ? JSON.parse(evidence) : [];
        evidence.push({text: range.toString(), comment_id: parentElementId.replace('comment_', '')});
        document.getElementById('evidence_' + docNum).value = JSON.stringify(evidence);
        document.getElementById('highlightCheck').innerHTML = checkHighlight() ? '✅' : '❌';
        checkRadioSelected();
        document.execCommand('hiliteColor', false, 'yellow');
        document.designMode = "off";

    }
}

function nextDoc() {
    if (currentDoc == 0) {
        currentDoc++;
        showDoc(currentDoc);
        console.log('');
        document.getElementById('nextButton').disabled = true;
    }
    else if (currentDoc < totalDocs - 1) {
        currentDoc++;
        showDoc(currentDoc);
        document.getElementById('nextButton').disabled = true;
    }
    else if (currentDoc == totalDocs - 1) {
        document.getElementById('questionWrap').classList.add('hidden');
        document.getElementById('submitButton').classList.remove('hidden');
    }
    document.getElementById('highlightCheck').innerHTML = '❌';
}

function checkRadioSelected() {
    if (currentDoc == 0) {
        checkSummaryText();
    } else {
        var radios = document.getElementsByName('doc_' + (currentDoc-1).toString());
        var nextButton = document.getElementById('nextButton');
        var isSelected = Array.from(radios).some(radio => radio.checked);
        var isHighlighted = checkHighlight();
        var isIrrelevant = document.getElementById('doc_' + (currentDoc-1) + '_irrelevant').checked;
        nextButton.disabled = !(isSelected && (isHighlighted || isIrrelevant));
        console.log("is_selected " + isSelected);
        console.log("is_highlighted " + isHighlighted);
        if (isIrrelevant) {
            document.getElementById('highlightCheckWrap').classList.add('hidden');
        } else {
            document.getElementById('highlightCheckWrap').classList.remove('hidden');
        }
    }
}

function checkSummaryText() {
    var summaryText = document.querySelector('textarea').value;
    var wordCount = summaryText.split(' ').filter(function(n) { return n != '' }).length;
    document.getElementById('summaryCheck').innerHTML = wordCount >= 5 ? '✅' : '❌';
    document.getElementById('nextButton').disabled = wordCount < 5;
}

var originalTexts = [];

function start() {
    document.getElementById('startButton').disabled = true;
    document.getElementById('summary').style.display = "block";
    var comments = document.getElementsByClassName('comment');
    for (var i = 0; i < comments.length; i++) {
        comments[i].classList.remove('hidden');
        originalTexts[i] = comments[i].innerHTML;
    }
    document.getElementById('nextCommentButton').style.display = "none";
    document.getElementById('startButton').style.display = "none";
    showDoc(currentDoc);
    console.log("is started true")
    isStarted = true;
}

document.oncopy = function() {
    return false;
}

window.onload = function() {
    openModal();
    nextComment();
};

function openModal() {
    document.getElementById('myModal').style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.getElementById('myModal').style.display = "none";
    document.body.style.overflow = "auto";
    currentTab = 0;
    switchTab('Instructions');
    document.getElementById('nextTabButton').classList.remove('hidden');
    document.getElementById('previousTabButton').classList.add('hidden');
}

function switchTab(tabName) {
    var i, tabcontent;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    document.getElementById(tabName).style.display = "block";
}

function checkHighlight() {
    console.log('evidence element: ' + (currentDoc - 1));
    var element = document.getElementById('evidence_' + (currentDoc - 1));
    console.log(element);
    var evidenceText = '';
    if (element) {
        var evidenceText = element.value;
    }
    console.log("evidence text " + evidenceText);
    return evidenceText != '';
}

function resetHighlight() {
    if (!isStarted) {
        return;
    }
    var highlightedTexts = document.querySelectorAll("span[style*='background-color: yellow']");
    highlightedTexts.forEach(function(highlightedText) {
        highlightedText.style.backgroundColor = "initial";
    });
    document.getElementById('evidence_' + (currentDoc-1)).value = null;
    document.getElementById('highlightCheck').innerHTML = '❌';
}

function handleFormSubmit() {
    const urlParams = new URLSearchParams(window.location.search)
    document.getElementById('inputAssignmentId').value = urlParams.get('assignmentId')
    document.getElementById('mturk_form').submit()
}

document.addEventListener('keypress', function(event) {
    if (event.key === 'h') {
        highlightText();
    }
    if (event.key === 'r') {
        var selectedText = window.getSelection();
        console.log('hello:1');
        if (selectedText.rangeCount > 0) {
            console.log('hello:2');
            resetHighlight();
        }
    }
});
