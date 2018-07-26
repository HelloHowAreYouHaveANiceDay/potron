

import { Utils } from '../../utils.js';

export class MeasurePanel {
  constructor(viewer, measurement, propertiesPanel) {
    this.viewer = viewer;
    this.measurement = measurement;
    this.propertiesPanel = propertiesPanel;

    this._update = () => { this.update(); };
  }

  createCoordinatesTable(points) {
    const table = $(`
			<table class="measurement_value_table">
				<tr>
					<th>x</th>
					<th>y</th>
					<th>z</th>
					<th></th>
				</tr>
			</table>
		`);

    const copyIconPath = `${Potree.resourcePath}/icons/copy.svg`;

    for (const point of points) {
      const x = Utils.addCommas(point.x.toFixed(3));
      const y = Utils.addCommas(point.y.toFixed(3));
      const z = Utils.addCommas(point.z.toFixed(3));

      const row = $(`
				<tr>
					<td><span>${x}</span></td>
					<td><span>${y}</span></td>
					<td><span>${z}</span></td>
					<td align="right" style="width: 25%">
						<img name="copy" title="copy" class="button-icon" src="${copyIconPath}" style="width: 16px; height: 16px"/>
					</td>
				</tr>
			`);

      this.elCopy = row.find('img[name=copy]');
      this.elCopy.click(() => {
        const msg = point.toArray().map(c => c.toFixed(3)).join(', ');
        Utils.clipboardCopy(msg);

        this.viewer.postMessage(
          `Copied value to clipboard: <br>'${msg}'`,
          { duration: 3000 });
      });

      table.append(row);
    }

    return table;
  }

  createAttributesTable() {
    const elTable = $('<table class="measurement_value_table"></table>');

    const point = this.measurement.points[0];

    if (point.color) {
      const color = point.color;
      const text = color.join(', ');

      elTable.append($(`
				<tr>
					<td>rgb</td>
					<td>${text}</td>
				</tr>
			`));
    }

    return elTable;
  }

  update() {

  }
}
