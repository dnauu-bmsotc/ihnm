## Выделение земельных угодий

### Теория

В проекте мы будем выделять следующие категории земельных угодий:

- Лесные
  
  - хвойные, на снимке тёмные;
  
  - смешанные;
  
  - лиственные, на снимке более светлые;
  
  - гари (горельники), на снимке чаще всего несколько сторон являются линиями, остальные стороны &ndash; кривыми;
    
    <img title="" src="landuse--cinder.png" alt="cinder.png" width="204" data-align="center">
  
  - вырубки.

- Пахотные
  
  - Пахотные (действующие). На спутниковых снимках это не всегда явно распашенные области. Часто пахотные угодья определяются только по следам распашки
  
  - Пахотные зарастающие. Заброшенные участки можно определить по наличию на них деревьев.
    
    <img title="" src="landuse--overgrown.png" alt="landuse--overgrown.png" data-align="center" width="231">

- Луговые (что не пашня — то луг; в отличие от пахотных угодий, луг имеет крупно-пятнистую структуру)
  
  - Пастбищные;
  
  - Кормовые (в отличие от пастбищных находятся на поймах и надпойменных террасах);
  
  - Неудобья. Например территория с могильниками около птицефабрики.

- Водоохранные
  
  - Ленточные леса. Это леса которые растут вдоль рек.
    
    <img title="" src="landuse--tape-forest.png" alt="landuse--tape-forest.png" data-align="center" width="372">

- Селитебные
  
  - Постоянного проживания
    
    - Сельского типа: наличие огородов, дома немногоквартирные;
      
      <img title="" src="landuse--village.png" alt="landuse--village.png" data-align="center" width="394">
    
    - Городского типа: отсутствуют огороды, дома многоквартирные.
      
      <img title="" src="landuse--city.png" alt="landuse--city.png" data-align="center" width="407">
  
  - Сезонного проживания
    
    - Дачного типа: обычно маленькие участки одинаковых размеров
      
      <img title="" src="landuse--dacha.png" alt="landuse--dacha.png" data-align="center" width="397">
    
    - Коттеджи: дома находятся далеко друг от друга
      
      <img title="" src="landuse--cottage.png" alt="landuse--cottage.png" data-align="center" width="384">

- Промышленные

- Дорожная инфраструктура
  
  - Автодорожные (только с покрытием). К области относятся также обочины и лесополосы.
  
  - Железнодорожные.

- Рекреационные (например санатории, пионерлагеря, туристические объекты, старые усадьбы, Заокский геополигон МИИГА\*К);

- Малоиспользуемые (например болота)

### Лабораторная

Каждый участок на поверхности земли является каким-либо угодьем. Определить тип угодья в нашем проекте можно по топокарте и космоснимку. Также можно использовать аэроснимок, если он дотягивается до нужного полуквадрата.

<img title="" src="landuse--aero-cosmo-topo.png" alt="landuse--aero-cosmo-topo.png" data-align="center" width="283">

На топокарте можно определить, например, состав крупных лесов, луговые территории и некоторые объекты, которые неразличимы на космоснимке.

Теперь приступим к выделению угодий.

1. Так как некоторые угодья могут содержать в себе угодья другого типа, то удобнее будет сначала выделять те угодья, внутри которых нет других угодий.
   
   <img title="" src="landuse--order.png" alt="landuse--order.png" data-align="center" width="498">
   
   Например, в данном случае, луговое угодье (неудобье) содержит в себе лесное угодье, дорожную инфраструктуру и промышленное угодье. Удобнее будет сначала выделить их, и только после – луг.

2. [Создаём слой](../other/add-layer/page.html) для лесных угодий, тип "Площадная". В список полей добавляем поле типа (чтобы разделить хвойные, лиственные и смешанные леса).
   
   <img title="" src="landuse--add-layer.png" alt="landuse--add-layer.png" data-align="center" width="489">Тип лесных угодий (хвойные, лиственные или смешанные) нужно определять по топографической карте или по цвету крон на космоснимке.

3. После выделения внутренних угодий, приступаем к выделению луговых угодий. Чтобы можно было выделить луговое угодье, не накладывая его на внутренние угодья, необходимо включить функцию "вырезать наложение".
   
   Заходим в [параметры привязки](../other/binding-parameters/page.html), включаем режим "Согласно расширенной настройки". Затем включаем привязку и "Вырезать наложение" для внутренних слоёв.
   
   <img title="" src="landuse--cut-overlay-3.png" alt="landuse--cut-overlay-3.png" data-align="center" width="539">

4. После этого можно создать новый слой "Луговые угодья" и выделить луг следующим образом:<img title="" src="landuse--cut-overlay.png" alt="landuse--cut-overlay.png" data-align="center" width="367">Если всё сделано правильно, то должно получиться подобное:
   
   <img title="" src="landuse--cut-overlay-2.png" alt="landuse--cut-overlay-2.png" data-align="center" width="364">
   
   Если при попытке создать новый объект вылезает ошибка о недействительной геометрии, нужно проверить, чтобы "Вырезать наложение" было включено только в тех слоях, в которых это нужно.
   
   <img title="" src="landuse--invalid-geometry.png" alt="landuse--invalid-geometry.png" data-align="center" width="580">

5. Продолжаем выделять угодья. На полуквадрате не должно остаться невыделенных мест.

В результате должно получиться что-то подобное:

<img title="" src="landuse--result.png" alt="landuse--result.png" width="636" data-align="center">

Замечания:

- Внутри селитебных не нужно выделять дороги;
- Пахотные угодья лучше выделять жёлтыми;
- Нарушенные участки (селитебные) лучше выделять красноватыми;
- Леса лучше выделять зелёными.

[Следующая часть](../p5-forest-formula/page.html)

[На главную](../index.html)
