(function () {
  "use strict";

  var root = document.documentElement;
  var siteShell = document.getElementById("site-shell");
  var profileSection = document.getElementById("profile-section");
  var themeToggle = document.getElementById("theme-toggle");
  var personName = document.getElementById("person-name");

  function preferredTheme() {
    var savedTheme = localStorage.getItem("static-basic-website-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    return "light";
  }

  function setTheme(theme) {
    var darkMode = theme === "dark";

    root.setAttribute("data-theme", darkMode ? "dark" : "light");
    themeToggle.setAttribute("aria-pressed", darkMode ? "true" : "false");
    themeToggle.setAttribute("aria-label", darkMode ? "Switch to light theme" : "Switch to dark theme");
    localStorage.setItem("static-basic-website-theme", darkMode ? "dark" : "light");
  }

  function safeText(value, fallback) {
    return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
  }

  function optionalText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function validatedUrl(value) {
    if (typeof value !== "string" || value.trim() === "") {
      return "";
    }

    try {
      var parsed = new URL(value.trim(), window.location.href);

      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.href;
      }
    } catch (error) {
      return "";
    }

    return "";
  }

  function loadJson(path) {
    return fetch(path, { cache: "no-store" }).then(function (response) {
      if (!response.ok) {
        throw new Error("Could not load " + path + ".");
      }

      return response.json();
    });
  }

  function createExternalIcon() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var firstPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var secondPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var thirdPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

    svg.setAttribute("class", "external-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    firstPath.setAttribute("d", "M14 4h6v6");
    secondPath.setAttribute("d", "M10 14 20 4");
    thirdPath.setAttribute("d", "M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5");

    svg.appendChild(firstPath);
    svg.appendChild(secondPath);
    svg.appendChild(thirdPath);

    return svg;
  }

  function createAccentLines() {
    var lines = document.createElement("div");
    var count = 0;

    lines.className = "accent-lines";
    lines.setAttribute("aria-hidden", "true");

    while (count < 3) {
      lines.appendChild(document.createElement("span"));
      count += 1;
    }

    return lines;
  }

  function createDescription(description, side) {
    var wrap = document.createElement("div");
    var text = document.createElement("p");

    wrap.className = "item-description-wrap item-description-" + side;
    text.className = "item-description";
    text.textContent = description;
    wrap.appendChild(text);

    return wrap;
  }

  function createLinkStack(item, side) {
    var stack = document.createElement("div");
    var visual = document.createElement("div");
    var circle = document.createElement("span");
    var link = document.createElement("a");
    var label = document.createElement("span");
    var url = validatedUrl(item.url);
    var name = safeText(item.name, "Link");

    stack.className = "link-stack item-" + side;
    visual.className = "link-visual";
    circle.className = "offset-circle";
    link.className = "link-button";
    label.textContent = name;

    link.appendChild(label);
    link.appendChild(createExternalIcon());

    if (url === "") {
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("tabindex", "-1");
      link.classList.add("link-button-disabled");
      link.addEventListener("click", function (event) {
        event.preventDefault();
      });
    } else {
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    visual.appendChild(circle);
    visual.appendChild(link);
    stack.appendChild(visual);
    stack.appendChild(createAccentLines());

    return stack;
  }

  function createItemSection(item, index) {
    var section = document.createElement("section");
    var content = document.createElement("div");
    var itemSide = index % 2 === 0 ? "right" : "left";
    var descriptionSide = itemSide === "right" ? "left" : "right";
    var description = optionalText(item.description);
    var name = safeText(item.name, "Link");
    var linkStack = createLinkStack(item, itemSide);

    section.className = "page-section item-section";
    section.setAttribute("aria-label", name + " link");
    content.className = "section-content item-section-content";

    if (itemSide === "right") {
      if (description !== "") {
        content.appendChild(createDescription(description, descriptionSide));
      } else {
        content.appendChild(createEmptyDescriptionSpace(descriptionSide));
      }

      content.appendChild(linkStack);
    } else {
      content.appendChild(linkStack);

      if (description !== "") {
        content.appendChild(createDescription(description, descriptionSide));
      } else {
        content.appendChild(createEmptyDescriptionSpace(descriptionSide));
      }
    }

    section.appendChild(content);
    return section;
  }

  function createEmptyDescriptionSpace(side) {
    var empty = document.createElement("div");

    empty.className = "item-description-wrap item-description-" + side + " item-description-empty";
    empty.setAttribute("aria-hidden", "true");

    return empty;
  }

  function createCopyrightNotice(name) {
    var footer = document.createElement("footer");
    var symbol = document.createElement("span");
    var copyrightName = document.createElement("span");

    footer.className = "copyright-notice";
    footer.appendChild(document.createTextNode("Copyright "));

    symbol.setAttribute("aria-hidden", "true");
    symbol.textContent = "©";
    footer.appendChild(symbol);
    footer.appendChild(document.createTextNode(" "));

    copyrightName.textContent = name;
    footer.appendChild(copyrightName);

    return footer;
  }

  function clearGeneratedSections() {
    var generated = siteShell.querySelectorAll(".item-section");
    var index = 0;

    while (index < generated.length) {
      generated[index].remove();
      index += 1;
    }

    profileSection.classList.remove("final-section");

    var oldProfileFooter = profileSection.querySelector(".copyright-notice");
    if (oldProfileFooter) {
      oldProfileFooter.remove();
    }
  }

  function renderItems(items, copyrightText) {
    var usableItems = Array.isArray(items) ? items : [];
    var index = 0;
    var generatedIndex = 0;
    var section;

    clearGeneratedSections();

    while (index < usableItems.length) {
      if (usableItems[index] && typeof usableItems[index] === "object") {
        section = createItemSection(usableItems[index], generatedIndex);
        siteShell.appendChild(section);
        generatedIndex += 1;
      }

      index += 1;
    }

    section = siteShell.querySelector(".item-section:last-of-type");

    if (!section) {
      section = profileSection;
    }

    section.classList.add("final-section");
    section.appendChild(createCopyrightNotice(copyrightText));
  }

  function fitDescription(element) {
    var wrap = element.parentElement;
    var maxSize = parseFloat(window.getComputedStyle(wrap).getPropertyValue("--description-max-size"));
    var minSize = parseFloat(window.getComputedStyle(wrap).getPropertyValue("--description-min-size"));
    var size = maxSize;

    if (!maxSize || !minSize) {
      return;
    }

    element.style.fontSize = maxSize + "px";

    while ((element.scrollHeight > wrap.clientHeight || element.scrollWidth > wrap.clientWidth) && size > minSize) {
      size -= 1;
      element.style.fontSize = size + "px";
    }
  }

  function fitDescriptions() {
    var descriptions = document.querySelectorAll(".item-description");
    var index = 0;

    while (index < descriptions.length) {
      fitDescription(descriptions[index]);
      index += 1;
    }
  }

  function debounce(callback, delay) {
    var timer = null;

    return function () {
      clearTimeout(timer);
      timer = setTimeout(callback, delay);
    };
  }

  setTheme(preferredTheme());

  themeToggle.addEventListener("click", function () {
    var currentTheme = root.getAttribute("data-theme");
    setTheme(currentTheme === "dark" ? "light" : "dark");
  });

  Promise.all([
    loadJson("data/person.json"),
    loadJson("data/items.json")
  ]).then(function (results) {
    var person = results[0];
    var items = results[1];
    var displayName = safeText(person.name, "John Doe");
    var footerName = safeText(person.copyright, displayName);

    personName.textContent = displayName;
    document.title = displayName;
    renderItems(items, footerName);

    window.requestAnimationFrame(fitDescriptions);
  }).catch(function (error) {
    console.error(error);
    renderItems([], "John Doe");
  });

  window.addEventListener("resize", debounce(fitDescriptions, 120));
}());
