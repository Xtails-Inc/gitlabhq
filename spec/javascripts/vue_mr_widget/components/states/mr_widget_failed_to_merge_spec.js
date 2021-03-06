import Vue from 'vue';
import failedToMergeComponent from '~/vue_merge_request_widget/components/states/mr_widget_failed_to_merge.vue';
import eventHub from '~/vue_merge_request_widget/event_hub';
import mountComponent from 'spec/helpers/vue_mount_component_helper';

describe('MRWidgetFailedToMerge', () => {
  let Component;
  let vm;

  beforeEach(() => {
    Component = Vue.extend(failedToMergeComponent);
    spyOn(eventHub, '$emit');
    vm = mountComponent(Component, { mr: {
      mergeError: 'Merge error happened.',
    } });
  });

  afterEach(() => {
    vm.$destroy();
  });

  describe('computed', () => {
    describe('timerText', () => {
      it('should return correct timer text', () => {
        expect(vm.timerText).toEqual('Refreshing in 10 seconds to show the updated status...');

        vm.timer = 1;
        expect(vm.timerText).toEqual('Refreshing in a second to show the updated status...');
      });
    });
  });

  describe('created', () => {
    it('should disable polling', () => {
      expect(eventHub.$emit).toHaveBeenCalledWith('DisablePolling');
    });
  });

  describe('methods', () => {
    describe('refresh', () => {
      it('should emit event to request component refresh', () => {
        expect(vm.isRefreshing).toEqual(false);

        vm.refresh();
        expect(vm.isRefreshing).toEqual(true);
        expect(eventHub.$emit).toHaveBeenCalledWith('MRWidgetUpdateRequested');
        expect(eventHub.$emit).toHaveBeenCalledWith('EnablePolling');
      });
    });

    describe('updateTimer', () => {
      it('should update timer and emit event when timer end', () => {
        spyOn(vm, 'refresh');

        expect(vm.timer).toEqual(10);

        for (let i = 0; i < 10; i += 1) {
          expect(vm.timer).toEqual(10 - i);
          vm.updateTimer();
        }

        expect(vm.refresh).toHaveBeenCalled();
      });
    });
  });

  describe('while it is refreshing', () => {
    it('renders Refresing now', (done) => {
      vm.isRefreshing = true;

      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.js-refresh-label').textContent.trim()).toEqual('Refreshing now');
        done();
      });
    });
  });

  describe('while it is not regresing', () => {
    it('renders warning icon and disabled merge button', () => {
      expect(vm.$el.querySelector('.js-ci-status-icon-warning')).not.toBeNull();
      expect(vm.$el.querySelector('.js-disabled-merge-button').getAttribute('disabled')).toEqual('disabled');
    });

    it('renders given error', () => {
      expect(vm.$el.querySelector('.has-error-message').textContent.trim()).toEqual('Merge error happened..');
    });

    it('renders refresh button', () => {
      expect(vm.$el.querySelector('.js-refresh-button').textContent.trim()).toEqual('Refresh now');
    });

    it('renders remaining time', () => {
      expect(
        vm.$el.querySelector('.has-custom-error').textContent.trim(),
      ).toEqual('Refreshing in 10 seconds to show the updated status...');
    });
  });

  it('should just generic merge failed message if merge_error is not available', (done) => {
    vm.mr.mergeError = null;

    Vue.nextTick(() => {
      expect(vm.$el.innerText).toContain('Merge failed.');
      expect(vm.$el.innerText).not.toContain('Merge error happened.');
      done();
    });
  });

  it('should show refresh label when refresh requested', (done) => {
    vm.refresh();
    Vue.nextTick(() => {
      expect(vm.$el.innerText).not.toContain('Merge failed. Refreshing');
      expect(vm.$el.innerText).toContain('Refreshing now');
      done();
    });
  });
});
