document.addEventListener("DOMContentLoaded", function () {
  const tabsContainer = document.querySelector(".rating__tabs");
  const tableContainer = document.getElementById("rating-table-container");

  let currentData = [];

  const createStarsHTML = (rating, isMobile) => {
    if (isMobile) {
      return `
        <div class="stars-rating">
          <span class="stars-rating__star"></span>
          <span class="stars-rating__value">${rating.toFixed(1)}</span>
        </div>
      `;
    }

    const fullStars = Math.round(rating);
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += `<span class="stars-rating__star ${i < fullStars ? '' : 'stars-rating__star--empty'}"></span>`;
    }

    return `
      <a href="" class="stars-rating">
        <span href="" class="stars-rating__stars">${stars}</span>
        <span class="stars-rating__value">${rating.toFixed(1)}</span>
      </a>
    `;
  };

  const createBadgeHTML = (badgeType) => {
    const badgeMap = {
      exclusive: { text: 'Эксклюзив', icon: false },
      'no-deposit': { text: 'Без депозита', icon: false },
      'no-bonus': { text: 'Нет бонуса', icon: false },
    };

    if (!badgeMap[badgeType]) return '';

    const { text, icon } = badgeMap[badgeType];
    const iconHTML = icon ? '<span class="icon icon--gift"></span>' : '';

    return `<span class="badge badge--${badgeType}">${iconHTML}${text}</span>`;
  };

  const createLogoCellHTML = (item) => `
    <div class="rating-table__cell rating-table__cell--logo">
      <img src="${item.logo}" alt="${item.name}" class="rating-table__logo">
      ${item.verified ? '<span class="verified-badge"></span>' : ''}
    </div>
  `;

  const createRatingCellHTML = (item, isMobile) => `
    <div class="rating-table__cell rating-table__cell--rating">
      ${createStarsHTML(item.rating, isMobile)}
    </div>
  `;

  const createReviewsCellHTML = (item) => `
    <div class="rating-table__cell rating-table__cell--reviews">
      <span class="icon icon--comments" title="Количество отзывов"></span>
      ${item.review_count}
    </div>
  `;

  const createBonusCellHTML = (item) => {
    const hasBonusAmount = item.bonus_amount > 0 && item.badge !== 'no-bonus';
    const badgeHTML = item.badge !== 'default' ? createBadgeHTML(item.badge) : '';
    const bonusAmountHTML = hasBonusAmount
      ? `<div class="rating-table__bonus-amount">
           <span class="icon icon--gift"></span>
           ${(item.bonus_amount / 1000).toLocaleString("ru-RU")}K ₽
         </div>`
      : '';

    return `
      <div class="rating-table__cell rating-table__cell--bonus">
        ${badgeHTML}
        ${bonusAmountHTML}
      </div>
    `;
  };

  const createActionsCellHTML = (item) => `
    <div class="rating-table__cell rating-table__cell--actions">
      <a href="${item.internal_link}" class="btn btn--secondary">ОБЗОР</a>
      <a href="${item.external_link}" class="btn btn--primary">САЙТ</a>
    </div>
  `;

  const renderTable = (data) => {
    if (!tableContainer) return;

    const isMobile = window.innerWidth <= 767;

    const rowsHTML = data.map(item => `
      <div class="rating-table__row">
        ${createLogoCellHTML(item)}
        ${createRatingCellHTML(item, isMobile)}
        ${!isMobile ? createReviewsCellHTML(item) : ''}
        ${createBonusCellHTML(item)}
        ${createActionsCellHTML(item)}
      </div>
    `).join('');

    tableContainer.innerHTML = `<div class="rating-table">${rowsHTML}</div>`;
  };

  const fetchAndRender = async (type = 'byuser') => {
    tableContainer.innerHTML = '<div style="padding: 40px; text-align: center;">Загрузка...</div>';
    try {
      const response = await fetch("data.json");
      let data = await response.json();

      switch (type) {
        case "bybonus":
          data.sort((a, b) => b.bonus_amount - a.bonus_amount);
          break;
        case "byeditors":
          data.reverse();
          break;
        case "byrating&id=reliability":
          data.sort((a, b) => b.rating - a.rating);
          break;
      }

      currentData = data;
      renderTable(currentData);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      tableContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: red;">Не удалось загрузить данные.</div>';
    }
  };

  tabsContainer.addEventListener("click", (event) => {
    const tab = event.target.closest(".rating__tab");
    if (!tab) return;

    tabsContainer.querySelector(".rating__tab--active").classList.remove("rating__tab--active");
    tab.classList.add("rating__tab--active");

    fetchAndRender(tab.dataset.type);
  });

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (currentData.length > 0) {
        renderTable(currentData);
      }
    }, 200);
  });

  fetchAndRender();
});