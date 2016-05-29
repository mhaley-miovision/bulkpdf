//$(document).ready(function () {
//  $('#pdf-viewer').load('/web/viewer.html');
//});

var files = [];
var goodList = [];
var badList = [];

$(document).ready(function() {
  rivets.bind($('#pdfList'), {files: files, loadPdf: loadPdf});
  rivets.bind($('#goodList'), {files: goodList, loadPdf: loadPdf});
  rivets.bind($('#badList'), {files: badList, loadPdf: loadPdf});
  rivets.bind($('.halfbtn'), {save: save, load: load});
  
  $.get('/list', function(data) {
    JSON.parse(data).forEach(function(file) {
      files.push(file);
    });


    $( ".sortable" ).sortable({
        connectWith: ".sortable"
    }).disableSelection();

  });
});


PDFJS.workerSrc = 'build/pdf.worker.js';

function save(event, el) {
  console.log("save");
  var pdfList = $.map($('#pdfList').find(".pdf"), function(el, i) {
    return el.textContent;
  });
  
  var goodList = $.map($('#goodList').find(".pdf"), function(el, i) {
    return el.textContent;
  });
  
  var badList = $.map($('#badList').find(".pdf"), function(el, i) {
    return el.textContent;
  }); 
  
  $.post("/save", JSON.stringify({pdfList: pdfList, goodList: goodList, badList: badList}));
}

function load(event, el) {
  console.log("load");
  $.get('/load', function(data) {
    var lists = data;
    
    files.splice(0,files.length);
    lists['pdfList'].forEach(function(file) {
      files.push(file);
    });
    
    goodList.splice(0,goodList.length);
    lists['goodList'].forEach(function(file) {
      goodList.push(file);
    });
    
    badList.splice(0,badList.length);
    lists['badList'].forEach(function(file) {
      badList.push(file);
    });
  });
}

function loadPdf(event, el) {
  var url = "pdf/" + el.files[el.index];
  $(".pdf").removeClass("active");
  $(this).addClass("active");

  PDFJS.getDocument(url).then(function getPdfHelloWorld(pdf) {
    
    console.log("Num pages: " + pdf.numPages);
    
    //clear current viewe
    $('.pdfpage').each(function (index, canvas) {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    });
    
    //add new canvases if needed
    for (var i = $('.pdfpage').size(); i < pdf.numPages; i++) {
      var canvas = document.createElement('canvas');
      canvas.className = "pdfpage";
      $('.pdfview')[0].appendChild(canvas);
    }
    
    //load in pages
    for (var i = 0; i < pdf.numPages; i++) {
      pdf.getPage(i+1).then(function (page) {
        var scale = 1.5;
        var viewport = page.getViewport(scale);
        var canvas = $('.pdfpage')[page.pageIndex];
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        var renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        page.render(renderContext);
      });
    }
  });
}
