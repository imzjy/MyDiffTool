function sort_lines(org_string, ignore_case) {
  return org_string
    .split("\n")
    .sort(function (a, b) {
      if (ignore_case) {
        a = a.toLowerCase();
        b = b.toLowerCase();
      }
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    })
    .join("\n");
}

function restore_last_editing() {
  $("#left").val(localStorage.getItem("left") || "");
  $("#right").val(localStorage.getItem("right") || "");

  $("#sort").prop("checked", localStorage.getItem("sort") === "true" || false);
  $("#ignore_case").prop(
    "checked",
    localStorage.getItem("ignore_case") === "true" || false
  );
  $("#single_column_view").prop(
    "checked",
    localStorage.getItem("single_column_view") === "true" || false
  );
}

function bind_auto_save() {
  $("#left").keyup(
    _.debounce(() => {
      console.log("left saved at" + new Date());
      localStorage.setItem("left", $("#left").val());
    }, 500)
  );

  $("#right").keyup(
    _.debounce(() => {
      console.log("right saved at" + new Date());
      localStorage.setItem("right", $("#right").val());
    }, 500)
  );

  $("#sort").change(() => {
    var is_sort = $("#sort").prop("checked");
    localStorage.setItem("sort", is_sort);
    do_compare();
  });

  $("#ignore_case").change(() => {
    var ignore_case = $("#ignore_case").prop("checked");
    localStorage.setItem("ignore_case", ignore_case);
    do_compare();
  });

  $("#single_column_view").change(() => {
    var single_column_view = $("#single_column_view").prop("checked");
    localStorage.setItem("single_column_view", single_column_view);
    // Trigger comparison when view mode changes
    do_compare();
  });
}

function do_compare() {
  var left = $("#left").val();
  var right = $("#right").val();

  var ignore_case = $("#ignore_case").prop("checked");
  var is_sort = $("#sort").prop("checked");
  var single_column = $("#single_column_view").prop("checked");

  if (is_sort) {
    left = sort_lines(left, ignore_case);
    right = sort_lines(right, ignore_case);
  }

  // console.log('left:' + left.length + '  right:' + right.length);

  var unitedDiff = Diff.createPatch("", left, right, "", "", {
    context: 9999,
    ignoreCase: ignore_case,
  });
  console.log(unitedDiff);

  const targetElement = document.getElementById("display");
  const configuration = {
    drawFileList: false,
    matching: "lines",
    outputFormat: single_column ? "line-by-line" : "side-by-side",
  };

  const diff2htmlUi = new Diff2HtmlUI(targetElement, unitedDiff, configuration);
  diff2htmlUi.draw();

  //$("#display").html(diffHtml);
}

function sync_input_textarea_height_if_resize(src, dest) {
  var src_time_id = null;
  var dest_time_id = null;
  var fps = 1000 / 30;

  src.mousedown(function () {
    src_time_id = setInterval(() => {
      dest.outerHeight(src.outerHeight());
    }, fps);
  });

  dest.mousedown(function () {
    dest_time_id = setInterval(() => {
      src.outerHeight(dest.outerHeight());
    }, fps);
  });

  $(window).mouseup(function () {
    if (src_time_id !== null) {
      clearInterval(src_time_id);
    }
    if (dest_time_id !== null) {
      clearInterval(dest_time_id);
    }

    //sync to elimiate very small hight diff
    src.outerHeight(dest.outerHeight());
  });
}

$(document).ready(() => {
  bind_auto_save();
  restore_last_editing();
  sync_input_textarea_height_if_resize($("#left"), $("#right"));

  $("#compare").click(do_compare);
});
