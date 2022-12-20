# Перемещение из слоя в слой

Допустим, необходимо перенести объект из слоя "Селитебные постоянного проживания" в слой "Селитебные сезонного проживания".

<img title="" src="move-objects--two-layers.png" alt="move-objects--two-layers.png" data-align="center" width="399">

1. Оба слоя должны быть в режиме правки;
   
   <img title="" src="move-objects--edit-mode.png" alt="move-objects--edit-mode.png" data-align="center" width="369">

2. С помощью инструмента "Выбрать объекты..." необходимо выделить нужный объект в слое "Селитебные постоянного проживания";
   
   <img title="" src="move-objects--select-objects.png" alt="move-objects--select-objects.png" data-align="center" width="538">

3. Выделенный объект подсветится жёлтым цветом;
   
   <img title="" src="move-objects--selected-object.png" alt="move-objects--selected-object.png" data-align="center" width="456">

4. Правка -> Вырезать объекты (или просто Ctrl+X);
   
   <img title="" src="move-objects--ctrl-x.png" alt="move-objects--ctrl-x.png" data-align="center" width="416">

5. Активируем слой "Селитебные сезонного проживания";
   
   <img title="" src="move-objects--activate-layer.png" alt="move-objects--activate-layer.png" data-align="center" width="415">

6. Правка -> Вставить объекты (или просто Ctrl+V);
   
   <img title="" src="move-objects--ctrl-v.png" alt="move-objects--ctrl-v.png" data-align="center" width="295">

7. Должно появиться сообщение о том, что объекты были успешно вставлены;
   
   <img title="" src="move-objects--infobox.png" alt="move-objects--infobox.png" data-align="center" width="383">

Если QGIS говорит, что объекты были вставлены, но Вы их не видите, то, возможно, для них нет подходящего стиля.

Нужно зайти в свойства слоя и настроить стили для новых объектов:

<img title="" src="move-objects--styles.png" alt="move-objects--styles.png" data-align="center" width="494">
