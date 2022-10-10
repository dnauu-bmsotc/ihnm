## Организация рабочей папки

При написании методички использовалась следующая структура папок. Сначала была создана рабочая папка (на картинке это "ПР") и в неё распакован скачанный архив ("КГС 3 курс"). Ещё была создана папка для первой работы.

<img title="" src="folder-organization--work-folder.png" alt="folder-organization--work-folder.png" data-align="center" width="302">

Открываем папку «КГС 3 курс». Файл проекта был сохранён в устаревшей версии, и чтобы его можно было свободно скопировать, его нужно сохранить в новой версии.

Открываем файл «Проект QGIS», нажимаем Ctrl+S и закрываем.

<img title="" src="folder-organization--deprecated-version.png" alt="folder-organization--deprecated-version.png" data-align="center" width="511">

После этого файл "Проект QGIS" можно скопировать в папку первой работы.

<img title="" src="folder-organization--copy-project.png" alt="folder-organization--copy-project.png" data-align="center" width="389">

Открываем файл и видим сообщение о недостающих слоях (рис 4). Нажимаем кнопку «Автопоиск».

<img title="" src="folder-organization--no-layers-1.png" alt="folder-organization--no-layers-1.png" data-align="center" width="517">

После этого Кугис должен найти все слои кроме трёх. Нажимаем применить изменения и закрываем окно.

<img title="" src="folder-organization--no-layers-2.png" alt="folder-organization--no-layers-2.png" data-align="center" width="506">

Может оказаться, что топокарта находится не там, где надо. Это не помешает работе.

<img title="" src="folder-organization-topomap-projection.png" alt="folder-organization-topomap-projection.png" data-align="center" width="583">

Если захочется исправить, то нужно [поменять проекцию слоя «Топокарта 1:25000» на EPSG:3785](../other/change-layer-projection.html).
