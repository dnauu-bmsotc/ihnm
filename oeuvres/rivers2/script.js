document.addEventListener("DOMContentLoaded", async function() {
    const generator = await tf.loadLayersModel('./generator/model.json');
    
    startRivgen(generator);
});

function rivgen(generator, params) {
    const {
        n=1,
        latent_dim=64,
        n_classes=17,
        noise=tf.randomNormal([n, latent_dim], 0, 1),
        int_c=tf.randomUniformInt([n], 0, maxval=n_classes),
        ohe_c=tf.oneHot(int_c, n_classes),
        resize=128,
        canvas=null,
    } = params;

    let imgs = generator.predict(noise.concat(ohe_c, 1));
    imgs = imgs.add(.5).clipByValue(0, 1);
    imgs = tf.image.resizeNearestNeighbor(imgs, [resize, resize]);
    imgs = tf.squeeze(imgs, 0);

    return canvas ? tf.browser.toPixels(imgs, canvas) : imgs;
}

async function startRivgen(generator) {
    const box = document.getElementById("generations");
    for (let i = 0; i < 100; i++) {
        const canvas = document.createElement("canvas");
        await rivgen(generator, {canvas: canvas});
        box.append(canvas);
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

// function rivgen(generator, latent_dim=64, n_classes=17, n=1,
// noise=null, int_c=null, ohe_c=null, canvas=null, resize=128) {
//     // create inputs
//     !noise && (noise = tf.randomNormal([n, latent_dim], 0, 1));
//     !int_c && (int_c = tf.randomUniformInt([n], 0, maxval=n_classes));
//     !ohe_c && (ohe_c = tf.oneHot(int_c, n_classes));
//     // generate
//     const gens = generator.predict(noise.concat(ohe_c, 1));
//     const imgs = gens.add(.5).clipByValue(0, 1);
//     imgs = tf.image.resizeNearestNeighbor(imgs, [resize, resize]);
//     // return promise or tensor
//     return canvas_id
//         ? tf.browser.toPixels(tf.squeeze(imgs, 0), canvas)
//         : imgs;
// }