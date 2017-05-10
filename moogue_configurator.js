var DEVICE_TYPE_DESKTOP = 'desktop';
var DEVICE_TYPE_TABLET = 'tablet';
var DEVICE_TYPE_MOBILE = 'mobile';
var width, height;
var configurator_element_id = "MoogueConfigurator";
var configurator_url_base = "http://dwl.3dprinttelefoonhoesje.nl";
var configurator_url_params = "";
var supports_webgl = 1;
var offset_x = 0;
var offset_y = 0;
var device_type = DEVICE_TYPE_DESKTOP;

$(document).ready(function () {
    setDeviceType();
});

function init3dPageLoad() {
    supports_webgl = supportsWebGl();

    $(window).bind('resizeEnd', function() {
        rescaleIframe();
    });

    rescaleIframe();
}

function rescaleIframe()
{
    setWidth();
    setHeight();

    if (width > 800) {
        $(".model").height(height).width(width);
    } else {
        $(".model").height(height).width('100%');
    }

    $("body").attr('style', 'margin: 0; padding: 0');
    $("#"+configurator_element_id).attr('width', width).attr('height', height);
    $("#"+configurator_element_id).attr('style', 'margin: 0; padding: 0; border: 0');

    startConfigurator();
}

function startConfigurator()
{
    validateRequiredParameters();

    if (project_url == null) {
        project_url = configurator_url_base;
    }
    var configurator_url = project_url + "/Integration/";

    configurator_url += "?User=" + user;
    configurator_url += "&Run=" + project_name;
    configurator_url += configurator_url_params;

    configurator_url += "&Breedte=" + width;
    configurator_url += "&Hoogte=" + height;
    configurator_url += "&webglsupport=" + (supports_webgl ? '1' : '0');

    configurator_url += "&device=" + device_type;

    var hash_params = window.location.hash.replace(/^\#/, "");
    if (hash_params) {
        configurator_url += hash_params;
    }

    $("#"+configurator_element_id).attr('src', configurator_url);
}

function setParameter(param_key, param_value)
{
    configurator_url_params += "&"+param_key+"="+param_value;
}

function validateRequiredParameters()
{
    if (user == null) {
        user = 'viewer';
    }

    if (project_name == null) {
        project_name = "DWP14-PhoneCases-V01";
    }
}

function supportsWebGl() {

    var support = true;

    try {

        var $canvas = $('<canvas />');
        $('body').append($canvas);
        var canvas = $canvas[0];

        if (canvas.addEventListener) {
            canvas.addEventListener("webglcontextcreationerror", function(event) {
                // console.log('webglcontextcreationerror');
                support = false;
            }, false);
        }

        var context = create3DContext(canvas);
        if (!context) {
            // console.log('No webgl context');

            if (!window.WebGLRenderingContext) {
                // console.log('No WebGLRenderingContext');
            }

            support = false;
        }
    }
    catch (e) {
        // console.log(e);
    } finally {
        $canvas.remove();
    }

    return support;
}

function create3DContext(canvas) {
    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    var context = null;
    for (var ii = 0; ii < names.length; ++ii) {
        try {
            context = canvas.getContext(names[ii]);
        } catch (e) {}
        if (context) {
            break;
        }
    }
    return context;
}

function setWidth() {
    var parentElementWidth  = $("#"+configurator_element_id).parent().width();
    var widthOffset         = 0;
    if (isWindows() && isFullScreen(parentElementWidth)) {
        widthOffset         = -25;
    }
    width                   = parentElementWidth + widthOffset + offset_x;
    return width;
}
function setHeight() {
    var clientWindowHeight  = document.documentElement.clientHeight;
    var heigthOffset        = -15;
    if (isWindows()) {
        // heigthOffset        = -25;
    }
    height                  = clientWindowHeight + heigthOffset + offset_y;

    if (device_type == DEVICE_TYPE_MOBILE && typeof height_offset_mobile !== 'undefined') {
        height += height_offset_mobile;
    } else if (device_type == DEVICE_TYPE_TABLET && typeof height_offset_tablet !== 'undefined') {
        height += height_offset_tablet;
    } else if(typeof height_offset_desktop !== 'undefined') {
        height += height_offset_desktop;
    }

    return height;
}
function isWindows() {
  return navigator.platform.indexOf('Win') > -1
}
function isFullScreen(parentElementWidth) {
    var clientWindowWidth  = document.documentElement.clientWidth;
    clientWindowWidth = clientWindowWidth - 75; // 75 pixels marge
    if (parentElementWidth > clientWindowWidth) {
        return true;
    }
    return false;
}

function setDeviceType() {
    $.getScript( "http://www.3dprinttelefoonhoesje.nl/js/mobile-detect.min.js" )
        .done(function( script, textStatus ) {
            var md = new MobileDetect(window.navigator.userAgent);
            if (md.tablet()) {
                device_type = DEVICE_TYPE_TABLET;
            } else if (md.mobile()) {
                device_type = DEVICE_TYPE_MOBILE;
            }

            init3dPageLoad();
        })
        .fail(function( jqxhr, settings, exception ) {
            if (window.console) {
                console.log('Failed to load mobile-detect');
            }
            device_type = DEVICE_TYPE_DESKTOP;
            return device_type;
        });
}
