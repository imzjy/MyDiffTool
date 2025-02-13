function sort_lines(org_string, ignore_case) {
  return org_string
    .split("\n")
    .sort((a, b) => {
      const x = ignore_case ? a.toLowerCase() : a;
      const y = ignore_case ? b.toLowerCase() : b;
      return x.localeCompare(y);
    })
    .join("\n");
}

function restore_last_editing() {
  const fields = ["left", "right"];
  const checkboxes = ["sort", "ignore_case", "single_column_view"];

  fields.forEach((field) => {
    $(`#${field}`).val(localStorage.getItem(field) || "");
  });

  checkboxes.forEach((checkbox) => {
    $(`#${checkbox}`).prop(
      "checked",
      localStorage.getItem(checkbox) === "true"
    );
  });
}

function setup_auto_save() {
  // Handle text inputs
  ["left", "right"].forEach((id) => {
    $(`#${id}`).keyup(
      _.debounce(() => {
        console.log(`${id} saved at ${new Date()}`);
        localStorage.setItem(id, $(`#${id}`).val());
      }, 500)
    );
  });

  // Handle checkboxes
  ["sort", "ignore_case", "single_column_view"].forEach((id) => {
    $(`#${id}`).change(() => {
      const value = $(`#${id}`).prop("checked");
      localStorage.setItem(id, value);
      do_compare();
    });
  });
}

function do_compare() {
  const left = $("#left").val();
  const right = $("#right").val();
  const ignore_case = $("#ignore_case").prop("checked");
  const is_sort = $("#sort").prop("checked");
  const single_column = $("#single_column_view").prop("checked");

  const processedLeft = is_sort ? sort_lines(left, ignore_case) : left;
  const processedRight = is_sort ? sort_lines(right, ignore_case) : right;

  const unitedDiff = Diff.createPatch(
    "",
    processedLeft,
    processedRight,
    "",
    "",
    {
      context: 9999,
      ignoreCase: ignore_case,
    }
  );
  console.log(unitedDiff);

  new Diff2HtmlUI(document.getElementById("display"), unitedDiff, {
    drawFileList: false,
    matching: "lines",
    outputFormat: single_column ? "line-by-line" : "side-by-side",
  }).draw();
}

function sync_input_textarea_if_height_resize(src, dest) {
  let activeInterval = null;

  function syncHeight(source, target) {
    target.outerHeight(source.outerHeight());
  }

  src.mousedown(() => {
    activeInterval = setInterval(() => syncHeight(src, dest), 33);
  });

  dest.mousedown(() => {
    activeInterval = setInterval(() => syncHeight(dest, src), 33);
  });

  $(window).mouseup(() => {
    if (activeInterval) {
      clearInterval(activeInterval);
      activeInterval = null;
    }
    syncHeight(dest, src); // Final sync
  });
}

$(document).ready(() => {
  setup_auto_save();
  restore_last_editing();
  sync_input_textarea_if_height_resize($("#left"), $("#right"));

  $("#compare").click(do_compare);
});
