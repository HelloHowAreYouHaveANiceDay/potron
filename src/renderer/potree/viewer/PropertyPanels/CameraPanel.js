
import { Utils } from '../../utils.js';

export class CameraPanel {
  constructor(viewer, propertiesPanel) {
    this.viewer = viewer;
    this.propertiesPanel = propertiesPanel;

    this._update = () => { this.update(); };

    const copyIconPath = `${Potree.resourcePath}/icons/copy.svg`;
    this.elContent = $(`
		<div class="propertypanel_content">
			<table>
				<tr>
					<th colspan="3">position</th>
					<th></th>
				</tr>
				<tr>
					<td align="center" id="camera_position_x" style="width: 25%"></td>
					<td align="center" id="camera_position_y" style="width: 25%"></td>
					<td align="center" id="camera_position_z" style="width: 25%"></td>
					<td align="right" id="copy_camera_position" style="width: 25%">
						<img name="copyPosition" title="copy" class="button-icon" src="${copyIconPath}" style="width: 16px; height: 16px"/>
					</td>
				</tr>
				<tr>
					<th colspan="3">target</th>
					<th></th>
				</tr>
				<tr>
					<td align="center" id="camera_target_x" style="width: 25%"></td>
					<td align="center" id="camera_target_y" style="width: 25%"></td>
					<td align="center" id="camera_target_z" style="width: 25%"></td>
					<td align="right" id="copy_camera_target" style="width: 25%">
						<img name="copyTarget" title="copy" class="button-icon" src="${copyIconPath}" style="width: 16px; height: 16px"/>
					</td>
				</tr>
			</table>
		</div>
		`);

    this.elCopyPosition = this.elContent.find('img[name=copyPosition]');
    this.elCopyPosition.click(() => {
      const pos = this.viewer.scene.getActiveCamera().position.toArray();
      const msg = pos.map(c => c.toFixed(3)).join(', ');
      Utils.clipboardCopy(msg);

      this.viewer.postMessage(
        `Copied value to clipboard: <br>'${msg}'`,
        { duration: 3000 });
    });

    this.elCopyTarget = this.elContent.find('img[name=copyTarget]');
    this.elCopyTarget.click(() => {
      const pos = this.viewer.scene.view.getPivot().toArray();
      const msg = pos.map(c => c.toFixed(3)).join(', ');
      Utils.clipboardCopy(msg);

      this.viewer.postMessage(
        `Copied value to clipboard: <br>'${msg}'`,
        { duration: 3000 });
    });

    this.propertiesPanel.addVolatileListener(viewer, 'camera_changed', this._update);

    this.update();
  }

  update() {
    console.log('updating camera panel');

    const camera = this.viewer.scene.getActiveCamera();
    const view = this.viewer.scene.view;

    const pos = camera.position.toArray().map(c => Utils.addCommas(c.toFixed(3)));
    this.elContent.find('#camera_position_x').html(pos[0]);
    this.elContent.find('#camera_position_y').html(pos[1]);
    this.elContent.find('#camera_position_z').html(pos[2]);

    const target = view.getPivot().toArray().map(c => Utils.addCommas(c.toFixed(3)));
    this.elContent.find('#camera_target_x').html(target[0]);
    this.elContent.find('#camera_target_y').html(target[1]);
    this.elContent.find('#camera_target_z').html(target[2]);
  }
}
