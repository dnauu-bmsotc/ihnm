## Выделение бассейнов

### Теория

**Бассейн** – это территория, на которой вся вода попадает в данный водоток. Порядок бассейна соответствует порядку его водотока.

### Лабораторная

[Создаём новый слой](../other/add-layer/page.html) с названием "Бассейны" и типом геометрии "Площадная". Ещё создаём поле "порядок" (тип "целое число"). 

<img title="" src="pools--layer-settings.png" alt="pools--layer-settings.png" data-align="center" width="579">

Также стОит [включить привязку](../other/binding-parameters/page.html) к вершинам созданного слоя.

Теперь начнём выделять бассейны ([создавать полигоны](../other/add-polygon/page.html)). Начинать нужно от "устья" каждого водотока и идти наверх, перпендикулярно горизонталям, пока линии с обеих сторон не сойдутся или пока не дойдут до водораздела.

<img title="" src="pools--perpendicular-begin.png" alt="pools-perpendicular-begin.png" data-align="center" width="276">

Порядок бассейна соответствует порядку его водотока.

<img title="" src="pools--attributes.png" alt="pools--attributes.png" data-align="center" width="434">

После создания объекта скорее всего окажется что он непрозрачный и за ним ничего не видно.

<img title="" src="pools--opaque.png" alt="pools--opaque.png" data-align="center" width="437">

Заходим в стили слоя и устанавливаем подходящую прозрачность.

<img title="" src="pools--layer-properties.png" alt="pools--layer-properties.png" data-align="center" width="319">

<img title="" src="pools--transparency.png" alt="pools--transparency.png" data-align="center" width="458">

Пример ситуации, когда линии не сходятся, их прерывает водораздел:

<img title="" src="pools--watershed.png" alt="pools--watershed.png" data-align="center" width="486">

После создания бассейнов нужно создать стили для каждого порядка. Заходим в свойства слоя, устанавливаем следующие настройки:

- "Символизацию по уникальным значениям"

- Значение "порядок"

Нажимаем "классифицировать", "ок".

<img title="" src="pools--layer-properties.png" alt="pools--layer-properties.png" data-align="center" width="296">

<img title="" src="pools--layer-classification.png" alt="pools--layer-classification.png" data-align="center" width="619">

В итоге должно получиться что-то подобное:

- На полуквадрате не должно остаться пустых мест;

- Линии должны быть плавными;

- Контуры бассейнов должны быть перпендикулярны к горизонталям;

- Бассейны более высокого порядка включают в себя бассейны низших порядков.

<img title="" src="pools--result-1.png" alt="pools--result-1.png" data-align="center" width="413">

За границами своего полуквадрата можно, конечно, и не рисовать.

<img title="" src="pools--result-2.png" alt="pools--result-2.png" data-align="center" width="326">

На этом с водными ресурсами всё.

[Следующая работа](../p4-landuse/page.html)

[Вернуться на главную](../index.html)
