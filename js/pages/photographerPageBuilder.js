"use strict";

import { Button } from "./components/buttons.js";
import { ContactModal, MediaModal } from "./components/modals.js";
import { MediumCard } from "./components/cards.js";
import { MediaFiltersDropdownMenu } from "./components/dropdown.js";
import { Logo } from "./components/logo.js";
import { MediaTagsNav } from "./components/tagsNav.js";

export class PhotographerPageBuilder {
  constructor(photographer, mediaList, checkedTag) {
    this._photographer = photographer;
    this._mediaList = mediaList;
    this._checkedTag = checkedTag;

    this._dropdownMenu = new MediaFiltersDropdownMenu();
  }

  render() {
    const contentWrapper = document.getElementById("p-spa-wrapper");

    contentWrapper.className = "p-photographer";

    this._renderHeader();
    this._renderMain();

    this._dropdownMenu.closeDropdownMenu("date");

    this._addOpenContactModalEvent();
    this._addSortWithDropdownMenu();
    this._addOpenMediaModalEvents();
    this._addLikesEvents();
  }

  _renderHeader() {
    const header = document.querySelector("header");

    header.innerHTML = new Logo().html;
  }

  _renderMain() {
    const main = document.querySelector("main");
    let htmlContent = "";

    htmlContent += this._templatePhotographerBanner(
      this._photographer,
      this._checkedTag
    );

    htmlContent += this._dropdownMenu.html;

    htmlContent += `<div class="row-12" id="cards-container">
                      ${this._templateMediaCards("date")}
                    </div>`;

    htmlContent += this._templatePhotographerSummary();

    main.innerHTML = htmlContent;
  }

  _templatePhotographerBanner() {
    let infosHtml = `<h1>${this._photographer.name}</h1>
                     <p class="p-banner__location">
                       ${this._photographer.city}, ${this._photographer.country}
                     </p>
                     <p class="p-banner__tagline">
                       ${this._photographer.tagline}
                     </p>`;
    let tagsNavHtml = new MediaTagsNav(this._photographer, this._checkedTag)
      .html;

    let infosAndTagsNavHtml = `<div class="lg4 md4 sm4">
                                ${infosHtml}
                                ${tagsNavHtml}
                              </div>`;

    let contactButtonHtml = new Button(
      "c-btn c-btn--cta c-btn--contact",
      "button",
      "Contactez-moi"
    ).html;
    let contactWrapperHtml = `<div class="lg4 md4 sm4">
                              ${contactButtonHtml}
                             </div>`;

    let portraitHtml = `<div class="lg4 md4 sm4 p-banner__portrait">
          <img 
            src="img/photographers/${this._photographer.portrait}" 
            alt="${this._photographer.name}" width="200" height="200" 
          />
                        </div>`;

    return `<section class="row-12 p-banner">
              ${infosAndTagsNavHtml}
              ${contactWrapperHtml}
              ${portraitHtml}
            </section>`;
  }

  _templateMediaCards(filter) {
    let photographerMedia = this._mediaList.filterByTagAndPhotographerId(
      this._checkedTag,
      this._photographer.id
    );

    if (filter == "date") photographerMedia.sortByDate();
    if (filter == "likes") photographerMedia.sortByLikes();
    if (filter == "title") photographerMedia.sortByTitle();

    let cardsHtml = "";

    for (let medium of photographerMedia.media) {
      cardsHtml += new MediumCard(this._photographer, medium).html;
    }

    return cardsHtml;
  }

  _templatePhotographerSummary() {
    const photographerMedia = this._mediaList.filterByTagAndPhotographerId(
      "all",
      this._photographer.id
    );

    let photographerTotalLikes = 0;

    for (let medium of photographerMedia.media) {
      photographerTotalLikes += medium.likes;
    }

    return `<aside class="p-photographer-summary">
              <span id="photographer-total-likes">
                ${photographerTotalLikes}
              </span>
              &nbsp;<i class="fas fa-heart"></i>
              <span>${this._photographer.price}&nbsp;€&nbsp;/&nbsp;jour</span>
            </aside>`;
  }

  _addOpenContactModalEvent() {
    const contactButton = document.querySelector(".c-btn--contact");

    contactButton.onclick = () => {
      const modalBackground = document.getElementById("modal-bg");
      const closeIcon = document.getElementById("close-icon");
      const modalContent = document.getElementById("modal-content");
      const contactModal = new ContactModal(this._photographer);

      closeIcon.classList = "light-icon";
      modalContent.classList.remove("c-media-modal");
      modalContent.classList.add("c-contact-modal");
      modalContent.innerHTML = contactModal.html;

      modalBackground.classList.add("displayed");
    };
  }

  _addSortWithDropdownMenu() {
    const dropdownMenu = document.querySelector(".p-dropdown--sr-only");

    dropdownMenu.onclick = () => {
      const currentFilter = dropdownMenu.value;

      console.log(`ON CLICK <select> | current filter = "${currentFilter}"`);
      this._dropdownMenu.openDropdownMenu(currentFilter);
    };

    dropdownMenu.onchange = () => {
      const selectedFilter = dropdownMenu.value;
      const cardsContainer = document.getElementById("cards-container");

      cardsContainer.innerHTML = this._templateMediaCards(selectedFilter);
      this._addOpenMediaModalEvents();
      this._addLikesEvents();
      this._dropdownMenu.closeDropdownMenu(selectedFilter);

      console.log(`ON CHANGE <select> | selected filter = "${selectedFilter}"`);
    };
  }

  _addOpenMediaModalEvents() {
    const mediaImages = document.getElementsByClassName("c-medium-card__img");

    for (const mediumImage of mediaImages) {
      mediumImage.onclick = () => {
        const mediumToDisplayId = mediumImage.getAttribute("data-medium-id");
        const modalBackground = document.getElementById("modal-bg");
        const closeIcon = document.getElementById("close-icon");
        const modalContent = document.getElementById("modal-content");
        const mediaModal = new MediaModal(
          this._photographer,
          this._mediaList.filterByTagAndPhotographerId(
            this._checkedTag,
            this._photographer.id
          ),
          mediumToDisplayId
        );

        closeIcon.classList = "";
        modalContent.classList.remove("c-contact-modal");
        modalContent.classList.add("c-media-modal");
        modalContent.innerHTML = mediaModal.html;

        mediaModal.addMouseNavigationEvents();

        modalBackground.classList.add("displayed");
      };
    }
  }

  _addLikesEvents() {
    const photographerMedia = this._mediaList.filterByTagAndPhotographerId(
      this._checkedTag,
      this._photographer.id
    );

    for (let medium of photographerMedia.media) {
      const likeButton = document.querySelector(
        `button[data-medium-id="${medium.id}"]`
      );
      const likesQuantitySpan = document.getElementById(
        `likes-quantity-${medium.id}`
      );
      const likeIcon = document.getElementById(`like-icon-${medium.id}`);
      const photographerTotalLikesSpan = document.getElementById(
        "photographer-total-likes"
      );

      likeButton.onclick = () => {
        let totalLikes = parseInt(photographerTotalLikesSpan.textContent);

        medium.isLiked = !medium.isLiked;

        if (medium.isLiked) {
          medium.likes += 1;
          totalLikes += 1;

          likeIcon.classList.remove("far");
          likeIcon.classList.add("fas");
        } else {
          medium.likes -= 1;
          totalLikes -= 1;

          likeIcon.classList.remove("fas");
          likeIcon.classList.add("far");
        }

        likesQuantitySpan.textContent = medium.likes;
        photographerTotalLikesSpan.textContent = totalLikes;
      };
    }
  }
}
