//Branding stuff
const versionName = document.createElement('div');
versionName.innerHTML = '<span class="TWSDversion" style="order: 1; padding: 9px;">Shovel Desktop 1.0</span>'

shovelIcon = "https://theshovel.github.io/Shovelicon.png"

//Replace extension gallery button because I can't fix it in electron
const newExtGalButton = document.createElement('div');

//Replace addons button
const newAddonsButton = document.createElement('button');
newAddonsButton.className = 'AddonsButtonDesktopify';
newAddonsButton.innerHTML = '<button type="button">Addons</button>'
newAddonsButton.style.background = 'transparent'
newAddonsButton.style.border = 'hidden'
newAddonsButton.style.paddingBottom = '15.5px'
newAddonsButton.style.paddingTop = '15.5px'
newAddonsButton.children.item(0).style.border = 'hidden'
newAddonsButton.children.item(0).style.background = 'transparent'
newAddonsButton.addEventListener('mouseover', function() {newAddonsButton.style.backgroundColor = 'var(--ui-black-transparent, hsla(0, 0%, 0%, 0.15))';});
newAddonsButton.addEventListener('mouseout', function() {
    newAddonsButton.style.backgroundColor = 'transparent';
  });
  newAddonsButton.addEventListener('click', function() {
    window.open('https://turbowarp.org/addons', 'Addons', 'width=700,height=725');;
});
//Replace packager button
const newPackagerButton = document.createElement('button');
newPackagerButton.className = 'PackagerButtonDesktopify';
newPackagerButton.innerHTML = '<button type="button">Package project</button>'
newPackagerButton.style.background = 'transparent'
newPackagerButton.style.border = 'hidden'
newPackagerButton.style.paddingRight = '79px'
newPackagerButton.style.whiteSpace = 'nowrap'
newPackagerButton.style.lineHeight = '30px'
newPackagerButton.style.display = 'block'
newPackagerButton.style.borderTop = '1px solid var(--ui-black-transparent, hsla(0, 0%, 0%, 0.15))'
newPackagerButton.children.item(0).style.border = 'hidden'
newPackagerButton.children.item(0).style.background = 'transparent'
newPackagerButton.addEventListener('mouseover', function() {newPackagerButton.style.backgroundColor = 'var(--ui-black-transparent, hsla(0, 0%, 0%, 0.15))';});
newPackagerButton.addEventListener('mouseout', function() {
    newPackagerButton.style.backgroundColor = 'transparent';
  });
  newPackagerButton.addEventListener('click', function() {
    window.open('https://packager.turbowarp.org/?import_from=https://turbowarp.org', 'Packager', 'width=700,height=750');
});

function addBranding(){
    try{
        document.querySelector('div[class^="menu-bar_main-menu"]').appendChild(versionName);
    }catch(err){
        setTimeout(function() {
            addBranding()
        }, 1);
    }
}
addBranding()
function replacePackaerButton(){
    try{
        document.querySelector("#app > div > div > div > div.gui_menu-bar-position_3U1T0.menu-bar_menu-bar_JcuHF.box_box_2jjDp > div.menu-bar_main-menu_3wjWH > div.menu-bar_file-group_1_CHX > div.menu-bar_menu-bar-item_oLDa-.menu-bar_hoverable_c6WFB.menu-bar_active_2Lfqh > div > ul > li:nth-child(5)").replaceWith(newPackagerButton)
    }catch(err){
    }
    try{
        document.querySelector("body > div.ReactModalPortal > div > div > div > div.library_library-scroll-grid_1jyXm.library_withFilterBar_26Opm > div:nth-child(12)").replaceWith(newExtGalButton);
    }catch(err){

    }
    if (document.querySelector('div[class^="scratchCategoryMenuItem scratchCategoryId-desktopify"]') != null){
        document.querySelector('div[class^="scratchCategoryMenuItem scratchCategoryId-desktopify"]').remove();
    }
    if (document.querySelector(".action-menu_main-icon_1ktMc").src != shovelIcon){
        document.querySelector(".action-menu_main-icon_1ktMc").src = shovelIcon;
    }

    document.title = "TurboWarp - Shovel Desktop";
    setTimeout(function() {
        replacePackaerButton()
    }, 1);
}
replacePackaerButton()
function dostuff()
{
    try{
    document.querySelector("#app > div > div > div > div.gui_menu-bar-position_3U1T0.menu-bar_menu-bar_JcuHF.box_box_2jjDp > div.menu-bar_main-menu_3wjWH > div:nth-child(5)").remove();
    document.querySelector("#app > div > div > div > div.gui_menu-bar-position_3U1T0.menu-bar_menu-bar_JcuHF.box_box_2jjDp > div.menu-bar_main-menu_3wjWH > div.menu-bar_file-group_1_CHX > div:nth-child(5)").replaceWith(newAddonsButton);
}catch(err){
        setTimeout(function() {
            dostuff()
        }, 1);
    }
}

dostuff()
class Shoveldesktopify {
    getInfo() {
      return {
        id: 'desktopify',
        name: ' ',
        blocks: [
        ]
      };
    }
  }
  
  Scratch.extensions.register(new Shoveldesktopify());